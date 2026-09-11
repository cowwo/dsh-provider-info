import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { getBuiltinModels, getBuiltinProviders } from '@earendil-works/pi-ai/providers/all'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

/**
 * Look up a source model in the pi-ai built-in catalog, preferring the exact
 * provider route, then any route, then a suffix-stripped sibling.
 * @returns the catalog model plus an `exact` flag, or null.
 */
function catalogLookup(provider, model) {
	try {
		const own = getBuiltinModels(provider).find((m) => m.id === model)
		if (own) return { model: own, exact: true }
	} catch { /* best-effort */ }
	try {
		for (const p of getBuiltinProviders()) {
			const m = getBuiltinModels(p).find((x) => x.id === model)
			if (m) return { model: m, exact: true }
		}
	} catch { /* best-effort */ }
	const stripped = model.replace(/(?:-vision-exp|-exp|-preview|-latest|-v[0-9]+)$/, '')
	if (stripped !== model) {
		try {
			for (const p of getBuiltinProviders()) {
				const m = getBuiltinModels(p).find((x) => x.id === stripped)
				if (m) return { model: m, exact: false }
			}
		} catch { /* best-effort */ }
	}
	return null
}

/* ------------------------------------------------------------------ *
 * 提供商余量（余额/限额）查询
 * ------------------------------------------------------------------ *
 * 接口探测规则：以提供商配置里的 baseURL 为主（不依赖自定义 route key），
 * 回退到 route key 里的家族标志。目前支持 DeepSeek（余额）与
 * OpenCode Go（5h/周/月限额）两家；其余已被社区验证有等价接口的厂商
 * 仅做识别并标记「暂不支持」，不对它们发起实际查询。
 */

// OpenCode Go 官方订阅限额（美元）：接口只回已用百分比 + 重置时间，金额按此换算。
const OPENCODE_LIMITS_USD = { rolling: 12, weekly: 30, monthly: 60 }

// ---- 插件设置（persistent）----
const SETTINGS_FILE = 'dsh-provider-info.json'
const SETTINGS_DEFAULTS = { hoverRefresh: true, autoRefreshOn: false, autoRefreshMin: 5, fontSize: 'middle', language: 'system' }
const settingPath = () => {
	const root = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
	return path.join(root, SETTINGS_FILE)
}
const clampSettings = (s) => {
	const out = { ...SETTINGS_DEFAULTS }
	if (s && typeof s === 'object') {
		out.hoverRefresh = s.hoverRefresh !== false
		out.autoRefreshOn = !!s.autoRefreshOn
		const min = Number(s.autoRefreshMin)
		out.autoRefreshMin = Number.isFinite(min) && min >= 1 ? Math.round(min) : SETTINGS_DEFAULTS.autoRefreshMin
		out.fontSize = ['large', 'middle', 'small'].includes(s.fontSize) ? s.fontSize : SETTINGS_DEFAULTS.fontSize
		out.language = ['system', 'en', 'zh'].includes(s.language) ? s.language : SETTINGS_DEFAULTS.language
	}
	return out
}
function readSettings() {
	try {
		const raw = fs.readFileSync(settingPath(), 'utf8')
		return clampSettings(JSON.parse(raw))
	} catch {
		return { ...SETTINGS_DEFAULTS }
	}
}
function writeSettings(settings) {
	const clean = clampSettings(settings)
	try {
		const f = settingPath()
		fs.mkdirSync(path.dirname(f), { recursive: true })
		fs.writeFileSync(f, JSON.stringify(clean, null, 2))
		try { fs.chmodSync(f, 0o600) } catch { /* best-effort */ }
	} catch (e) {
		console.warn('[provider-badge] 写入设置失败', e)
	}
	return clean
}

// 余额/限额为低频变化数据（5 小时/天/月窗口），host 端按 provider 缓存 5 分钟，
// 避免每次悬停都打到厂商接口。切走再切回同一 provider 时若未过期，直接用缓存。
const BALANCE_CACHE_TTL_MS = 5 * 60 * 1000
const balanceCache = new Map()
// 在途查询合并：同一 provider（同 force 标记）的并发请求共用一次厂商查询。
const balanceInflight = new Map()

// 厂商家族识别表：markers 命中任何一个即判定为对应家族。
// supported=true 的家族才实际查询；其余识别后回「暂不支持」。
const FAMILY_MARKERS = [
	{ family: 'deepseek', kind: 'balance', supported: true, markers: ['api.deepseek.com', 'deepseek'], env: 'DEEPSEEK_API_KEY' },
	{ family: 'opencode-go', kind: 'limits', supported: true, markers: ['opencode.ai', 'opencode-go', 'opencode'], env: 'OPENCODE_GO_API_KEY' },
	{ family: 'commandcode', kind: 'limits', supported: true, markers: ['commandcode.ai', 'commandcode'], env: 'CMD_01_API_KEY' },
	{ family: 'kimi', kind: 'limits', supported: false, markers: ['api.kimi.com', 'kimi'], env: 'KIMI_CODING_API_KEY' },
	{ family: 'zhipu', kind: 'limits', supported: false, markers: ['open.bigmodel.cn', 'api.z.ai', 'zai', 'bigmodel'], env: 'ZAI_API_KEY' },
	{ family: 'minimax', kind: 'limits', supported: false, markers: ['api.minimaxi.com', 'api.minimax.io', 'minimax'], env: 'MINIMAX_API_KEY' },
	{ family: 'openrouter', kind: 'balance', supported: false, markers: ['openrouter.ai', 'openrouter'], env: 'OPENROUTER_API_KEY' },
	{ family: 'codex', kind: 'limits', supported: false, markers: ['chatgpt.com', 'openai-codex', 'codex'], env: 'OPENAI_CODEX_ACCESS_TOKEN' }
]

function detectFamily(baseURL, provider) {
	const haystack = ((baseURL || '') + ' ' + (provider || '')).toLowerCase()
	for (const fam of FAMILY_MARKERS) {
		if (fam.markers.some((m) => haystack.includes(m.toLowerCase()))) return fam
	}
	return null
}

function toNum(v) {
	if (v === null || v === undefined || v === '') return null
	const n = Number(v)
	return Number.isFinite(n) ? n : null
}

// 统一请求：超时、JSON 解析、非 2xx 归类。
async function requestJson(url, headers, timeoutMs = 15000) {
	const ctrl = new AbortController()
	const timer = setTimeout(() => ctrl.abort(), timeoutMs)
	try {
		const res = await fetch(url, { headers, signal: ctrl.signal, redirect: 'follow' })
		let errType = null
		let errMsg = null
		let body = null
		try {
			body = await res.json()
			if (body && body.error) {
				errType = typeof body.error.type === 'string' ? body.error.type : null
				errMsg = typeof body.error.message === 'string' ? body.error.message : null
			}
		} catch { /* 非 JSON 响应 */ }
		if (!res.ok) {
			return { httpError: 'http-' + res.status, status: res.status, providerType: errType, providerMessage: errMsg }
		}
		if (body && body.error) {
			return { httpError: errMsg || errType || 'provider-error', status: res.status, providerType: errType, providerMessage: errMsg }
		}
		return { body }
	} catch (e) {
		return { httpError: e && e.name === 'AbortError' ? 'timeout' : 'network' }
	} finally {
		clearTimeout(timer)
	}
}

// DeepSeek：账户余额金额。
async function queryDeepSeek(base, key) {
	const baseUrl = ((base || 'https://api.deepseek.com').replace(/\/$/, ''))
	const { body, httpError } = await requestJson(baseUrl + '/user/balance', {
		Authorization: 'Bearer ' + key,
		Accept: 'application/json'
	})
	if (httpError) return { ok: false, error: httpError }
	const infos = Array.isArray(body && body.balance_infos) ? body.balance_infos : []
	return {
		ok: true,
		balance: {
			is_available: !!(body && body.is_available !== false),
			balance_infos: infos.map((i) => ({
				currency: typeof i.currency === 'string' ? i.currency : null,
				total_balance: toNum(i.total_balance),
				granted_balance: toNum(i.granted_balance),
				topped_up_balance: toNum(i.topped_up_balance)
			}))
		}
	}
}

// OpenCode Go：5h / 周 / 月 已用百分比 + 重置时间。
function pickOpencodeWindow(w) {
	if (!w || typeof w !== 'object') return null
	const percent = toNum(w.percent)
	const status = typeof w.status === 'string' ? w.status : null
	return { percent, status, rateLimited: status === 'rate-limited', resetsAt: typeof w.resetsAt === 'string' ? w.resetsAt : null }
}

async function queryOpencodeGo(base, key) {
	// baseURL 可能是 .../zen/go 或 .../zen/go/v1（用户配置自带 /v1），归一化到 /v1/usage。
	const normBase = ((base || 'https://opencode.ai/zen/go').replace(/\/$/, '').replace(/\/v1$/, ''))
	const { body, httpError, providerType } = await requestJson(normBase + '/v1/usage', {
		Authorization: 'Bearer ' + key,
		'x-api-key': key,
		Accept: 'application/json',
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
	})
	if (httpError) {
		// opencode 403=EntitlementError（无订阅权限）区别于普通密钥/地址错误。
		if (httpError === 'http-401' || httpError === 'http-403') {
			return { ok: false, error: providerType === 'EntitlementError' ? 'subscription-required' : 'unauthorized' }
		}
		return { ok: false, error: httpError }
	}
	const usage = body && body.usage ? body.usage : null
	if (!usage || typeof usage !== 'object') return { ok: false, error: 'missing-usage' }
	const windows = []
	for (const route of [['rolling', '5小时'], ['weekly', '7天'], ['monthly', '30天']]) {
		const key = route[0]
		const label = route[1]
		const w = pickOpencodeWindow(usage[key])
		if (!w) continue
		windows.push({ key, label, kind: 'percent', percent: w.percent, status: w.status, rateLimited: w.rateLimited, resetsAt: w.resetsAt, limitUsd: OPENCODE_LIMITS_USD[key] || null })
	}
	if (!windows.length) return { ok: false, error: 'missing-windows' }
	return { ok: true, windows }
}

// Command Code（GOAT / Pro / Max 等 coding plan）：官方 CLI 内部接口（同 key、纯 GET 只读）——
//   GET /alpha/billing/credits        → 月度剩余 credits + 5小时/每周 滚动窗口（used/cap/exceeded/resetAt）
//   GET /alpha/billing/subscriptions  → planId + 计费周期（用于展示套餐名与到期时间）
// 归一化成与 OpenCode Go 一致的 window 结构（rolling=5小时、weekly=7天）。
// 「月度总额度」不做本地硬编码映射：接口不返回月池总额，这里按 周窗 cap × 2 动态推导
// （GOAT/Pro 的月池 = 周窗×2，例如 GOAT 35×2=70；官方调整窗口值后接口会实时返回、自动跟随）。
async function queryCommandCode(base, key) {
	let origin = 'https://api.commandcode.ai'
	try { origin = new URL(base || origin).origin } catch { /* 回退默认 */ }
	const authHeaders = { Authorization: 'Bearer ' + key, Accept: 'application/json' }
	// 两个接口并行取（实测串行冷启动 ~2.6s → 并行 ~1.2s；热态各自 ~0.33s），
	// 这是“悬停余量出现慢”的主要来源。
	const [creditsRes, subRes] = await Promise.all([
		requestJson(origin + '/alpha/billing/credits', authHeaders),
		requestJson(origin + '/alpha/billing/subscriptions', authHeaders)
	])
	if (creditsRes.httpError) {
		if (creditsRes.httpError === 'http-401' || creditsRes.httpError === 'http-403') {
			return { ok: false, error: creditsRes.httpError === 'http-403' ? 'subscription-required' : 'unauthorized' }
		}
		return { ok: false, error: creditsRes.httpError }
	}
	const body = creditsRes.body && typeof creditsRes.body === 'object' ? creditsRes.body : {}
	const credits = body.credits && typeof body.credits === 'object' ? body.credits : null
	const limits = body.windowLimits && typeof body.windowLimits === 'object' ? body.windowLimits : null
	if (!credits || !limits) return { ok: false, error: 'missing-usage' }
	const windows = []
	let weeklyCap = null
	for (const [winKey, label, outKey] of [['fiveHour', '5小时', 'rolling'], ['weekly', '7天', 'weekly']]) {
		const w = limits[winKey]
		if (!w || typeof w !== 'object') continue
		const used = toNum(w.used)
		const cap = toNum(w.cap)
		if (cap === null || cap <= 0) continue
		if (outKey === 'weekly') weeklyCap = cap
		// 百分比保留原始精度，由客户端统一格式化为两位小数。
		const pct = used === null ? null : (used / cap) * 100
		windows.push({
			key: outKey, label, kind: 'percent', percent: pct,
			status: w.exceeded ? 'rate-limited' : null,
			rateLimited: !!w.exceeded,
			resetsAt: typeof w.resetAt === 'number' ? new Date(w.resetAt).toISOString() : (typeof w.resetAt === 'string' ? w.resetAt : null),
			limitUsd: cap
		})
	}
	// 月度剩余：月度池剩余 + 额外购买 + 赠送（与官方 CLI 的 totalRemaining 口径一致）。
	const monthlyRemaining = (toNum(credits.monthlyCredits) || 0) + (toNum(credits.purchasedCredits) || 0) + (toNum(credits.freeCredits) || 0)
	let monthly = null
	if (credits.monthlyCredits != null || credits.purchasedCredits != null || credits.freeCredits != null) {
		let planId = null
		let periodEnd = null
		if (!subRes.httpError && subRes.body && subRes.body.data) {
			const d = subRes.body.data
			if (typeof d.planId === 'string') planId = d.planId
			if (typeof d.currentPeriodEnd === 'string') periodEnd = d.currentPeriodEnd
		}
		const total = weeklyCap !== null ? weeklyCap * 2 : null
		let daysLeft = null
		if (periodEnd) {
			const ms = Date.parse(periodEnd)
			if (ms === ms) daysLeft = Math.max(0, Math.ceil((ms - Date.now()) / 86400000))
		}
		monthly = {
			remaining: Math.round(monthlyRemaining * 100) / 100,
			total: total == null ? null : total,
			plan: planId || null,
			currency: 'USD',
			periodEnd: periodEnd || null,
			daysLeft
		}
	}
	if (!windows.length && !monthly) return { ok: false, error: 'missing-windows' }
	return { ok: true, windows, monthly }
}

// 凭据解析：优先用 profile 的 apiKeyEnv，缺失时回退家族 env。
async function resolveKey(ctx, apiKeyEnv, familyEnv) {
	const candidates = []
	if (apiKeyEnv && typeof apiKeyEnv === 'string' && apiKeyEnv.length > 0) candidates.push(apiKeyEnv)
	if (familyEnv && familyEnv !== apiKeyEnv) candidates.push(familyEnv)
	for (const name of candidates) {
		try {
			const resolved = await ctx.credentials.resolve(name)
			if (resolved && resolved.value) return { key: resolved.value, from: name }
		} catch { /* 尝试下一个 */ }
	}
	return { key: null, from: null }
}

/**
 * 提供商徽章服务：为悬浮浮层读取当前模型的目录真值
 * （上下文窗口、最大 token、输入模态）以及当前提供商的余量
 * （余额金额或订阅限额）。通过 typert `providerBadge/*` 端点暴露给浏览器端。
 */
export class ProviderBadgeService extends TypertRemoteService {
	static inject = ['llm', 'credentials', 'settings']

	constructor(ctx, config) {
		super(ctx, 'providerBadge')
	}

	/**
	 * @param request - { provider, model } of the current model.
	 * @returns { contextWindow, maxTokens, input } from the catalog, or nulls.
	 */
	async modelInfo(request) {
		const provider = request && request.provider
		const model = request && request.model
		if (!provider || !model) throw new Error('providerBadge/modelInfo: provider and model are required')
		const found = catalogLookup(provider, model)
		const m = found ? found.model : null
		let input = null
		try {
			const info = await this.ctx.llm.resolveModelInfo(provider, model)
			if (info && Array.isArray(info.inputModalities)) {
				input = info.inputModalities.includes('image') ? ['text', 'image'] : [...info.inputModalities]
			}
		} catch { /* best-effort */ }
		return {
			contextWindow: m && m.contextWindow != null ? m.contextWindow : null,
			maxTokens: m && m.maxTokens != null ? m.maxTokens : null,
			input
		}
	}

	/**
	 * 枚举**当前已启用**的提供商：只取 DSH 真正会用来发请求的路由。
	 *
	 * 主路径：`ctx.llm.listProviders()` —— llm 适配器表里的已注册路由
	 * （每条形如 `{ id, name }`，如 `deepseek-official` / `cmd-01` / `og-01`），
	 * 再 join `listConfigurableProviders()` 目录拿 settingsNs / settingsPath，
	 * 按路径下钻 settings 取该 provider 的 baseURL / apiKeyEnv。
	 * 这份清单与「设置 → 模型」页展示的一致；`name` 即该页显示的名称。
	 *
	 * 为什么不用 `listConfigurableProviders()` 直接枚举（旧实现）：该目录被
	 * dsh-llm-pi-ai 用 pi-ai 的**全部内置 provider**（39 个，如 kimi-coding /
	 * minimax / zai / opencode 等）填充过一遍，直接枚举会把大量本机从未配置的
	 * 内置项列进表格（表现为一整屏「暂不支持」/「未配置 API Key」），并且
	 * 内置的 `deepseek` 会与官方 `deepseek-official` 重复成两行、查同一个账户。
	 * 该目录仍保留，仅用于给已注册路由补 baseURL / apiKeyEnv。
	 * @returns { providers: [{ provider, displayName, baseURL, apiKeyEnv }] }
	 */
	async providers(_request) {
		const out = []
		const seen = new Set()
		// 读全部 settings namespace 的当前解析值，key 为 ns。
		let nsValues = new Map()
		try {
			const descs = this.ctx.settings.describe() || []
			for (const d of descs) if (d && d.ns && d.value != null) nsValues.set(d.ns, d.value)
		} catch (e) {
			console.warn('[provider-badge] settings.describe 失败', e)
		}
		const pushOne = (provider, displayName, baseURL, apiKeyEnv) => {
			if (!provider) return
			const key = String(provider)
			if (seen.has(key)) return
			seen.add(key)
			out.push({ provider: key, displayName: displayName || null, baseURL: baseURL || null, apiKeyEnv: apiKeyEnv || null })
		}
		// configurable 目录按 provider id 索引，供 join 取 settings 落点。
		let byProvider = new Map()
		try {
			const cfgs = this.ctx.llm.listConfigurableProviders ? this.ctx.llm.listConfigurableProviders() : []
			for (const cp of cfgs) if (cp && cp.provider) byProvider.set(String(cp.provider), cp)
		} catch (e) { console.warn('[provider-badge] 读取 configurable 目录失败', e) }
		// 取某 provider 在 settings 里的 profile 对象；空 settingsPath = 整个 section。
		const profileOf = (cp) => {
			if (!cp) return null
			let profile = nsValues.get(cp.settingsNs)
			if (profile == null) return null
			if (cp.settingsPath && cp.settingsPath.length) {
				for (const seg of cp.settingsPath) {
					if (profile == null) break
					profile = profile[seg]
				}
			}
			return profile
		}
		// 已注册路由 → join 目录 → 下钻 settings，取展示名与查询所需的 baseURL/apiKeyEnv。
		const collectRoute = (route) => {
			const id = route && (route.id || route.provider)
			if (!id) return
			const cp = byProvider.get(String(id))
			const profile = profileOf(cp)
			// 展示名优先用适配器声明（如 DeepSeek），退回 settings 的 displayName。
			const displayName = (route && route.name) || (profile && (profile.displayName || profile.name)) || (cp && cp.displayName) || String(id)
			const baseURL = (profile && (profile.baseURL || profile.baseUrl)) || null
			const apiKeyEnv = (profile && profile.apiKeyEnv) || null
			pushOne(id, displayName, baseURL, apiKeyEnv)
		}
		// ---- 主路径：只列已注册（= 已启用）的路由 ----
		let registered = null
		try {
			registered = this.ctx.llm.listProviders ? this.ctx.llm.listProviders() : null
		} catch (e) { console.warn('[provider-badge] 枚举已注册提供商失败', e) }
		if (Array.isArray(registered) && registered.length) {
			for (const route of registered) collectRoute(route)
			return { providers: out }
		}
		// ---- 兜底：拿不到已注册路由时，退回旧逻辑（自定义 + 官方/内置目录）----
		// 注意：旧逻辑会带上 pi-ai 内置的未配置项，仅在 listProviders 不可用时降级使用。
		try {
			const custom = nsValues.get('llm-pi-ai') && nsValues.get('llm-pi-ai').providers
			if (custom && typeof custom === 'object') {
				for (const id of Object.keys(custom)) {
					const c = custom[id] || {}
					pushOne(id, c.displayName || null, c.baseURL || c.baseUrl || null, c.apiKeyEnv || null)
				}
			}
		} catch (e) { console.warn('[provider-badge] 枚举自定义提供方失败', e) }
		for (const cp of byProvider.values()) {
			const profile = profileOf(cp)
			const displayName = (profile && (profile.displayName || profile.name)) || cp.displayName || cp.provider
			const baseURL = (profile && (profile.baseURL || profile.baseUrl)) || null
			const apiKeyEnv = (profile && profile.apiKeyEnv) || null
			pushOne(cp.provider, displayName, baseURL, apiKeyEnv)
		}
		return { providers: out }
	}

	/**
	 * 查询当前提供商的余量（余额/限额）。仅 DeepSeek、OpenCode Go 与 Command Code 实际查询；
	 * 其余已识别的厂商回 supported:false + recognized:true，由客户端显示「暂不支持」。
	 * @param request - { provider, baseURL, apiKeyEnv } of the current provider route.
	 * @returns normalized payload.
	 */
	async balance(request) {
		const provider = request && request.provider
		const baseURL = request && request.baseURL
		const apiKeyEnv = request && request.apiKeyEnv
		const force = !!(request && request.force)
		if (!provider) throw new Error('providerBadge/balance: provider is required')
		const fam = detectFamily(baseURL, provider)
		// 完全未识别的厂商：不展示余量区块。
		if (!fam) return { supported: false, recognized: false, family: null, kind: null, error: null, balance: null, windows: null }
		// 已识别但暂不支持查询的厂商：不走网络，直接标记。
		if (!fam.supported) return { supported: false, recognized: true, family: fam.family, kind: fam.kind, error: 'not-supported', balance: null, windows: null }
		// 支持查询但未配置密钥：也不走网络。
		const { key } = await resolveKey(this.ctx, apiKeyEnv, fam.env)
		if (!key) return { supported: true, recognized: true, family: fam.family, kind: fam.kind, error: 'no-api-key', balance: null, windows: null }
		// 5 分钟缓存：命中且未过期直接回；否则重新查询并写回。
		// force=true（手动刷新）时绕过缓存命中，重新查询并写回，之后仍正常兜底 5 分钟。
		const cacheKey = provider + '\n' + baseURL + '\n' + fam.env
		const now = Date.now()
		const hit = balanceCache.get(cacheKey)
		if (!force && hit && now - hit.fetchedAt < BALANCE_CACHE_TTL_MS) return hit.value
		// 并发合并：同一 provider 在途的查询复用同一个 Promise，快速反复悬停/多端同时查不会堆请求。
		const inflightKey = cacheKey + '\n' + (force ? 'force' : 'cached')
		const running = balanceInflight.get(inflightKey)
		if (running) return running
		const task = (async () => {
			try {
				let result = null
				switch (fam.family) {
					case 'deepseek': result = await queryDeepSeek(baseURL, key); break
					case 'opencode-go': result = await queryOpencodeGo(baseURL, key); break
					case 'commandcode': result = await queryCommandCode(baseURL, key); break
				}
				let value
				if (!result || !result.ok) {
					value = { supported: true, recognized: true, family: fam.family, kind: fam.kind, error: result ? result.error : 'unknown', balance: null, windows: null }
				} else {
					value = { supported: true, recognized: true, family: fam.family, kind: fam.kind, error: null, balance: result.balance || null, windows: result.windows || null, membership: result.membership || null, monthly: result.monthly || null }
				}
				balanceCache.set(cacheKey, { fetchedAt: Date.now(), value })
				return value
			} catch (e) {
				return { supported: true, recognized: true, family: fam.family, kind: fam.kind, error: e && e.message ? e.message : 'unknown', balance: null, windows: null }
			} finally {
				balanceInflight.delete(inflightKey)
			}
		})()
		balanceInflight.set(inflightKey, task)
		return task
	}

	/**
	 * 读取/写入插件设置。op='get' 返回当前设置；op='set' 合并 patch 并持久化。
	 * @param request - { op, patch? }.
	 * @returns { settings }.
	 */
	async settings(request) {
		const op = request && request.op
		if (op === 'set') {
			const clean = writeSettings({ ...readSettings(), ...(request.patch || {}) })
			return { settings: clean }
		}
		return { settings: readSettings() }
	}
}

export default ProviderBadgeService