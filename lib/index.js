import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { getBuiltinModels, getBuiltinProviders } from '@earendil-works/pi-ai/providers/all'

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

// 余额/限额为低频变化数据（5 小时/天/月窗口），host 端按 provider 缓存 5 分钟，
// 避免每次悬停都打到厂商接口。切走再切回同一 provider 时若未过期，直接用缓存。
const BALANCE_CACHE_TTL_MS = 5 * 60 * 1000
const balanceCache = new Map()

// 厂商家族识别表：markers 命中任何一个即判定为对应家族。
// supported=true 的家族才实际查询；其余识别后回「暂不支持」。
const FAMILY_MARKERS = [
	{ family: 'deepseek', kind: 'balance', supported: true, markers: ['api.deepseek.com', 'deepseek'], env: 'DEEPSEEK_API_KEY' },
	{ family: 'opencode-go', kind: 'limits', supported: true, markers: ['opencode.ai', 'opencode-go', 'opencode'], env: 'OPENCODE_GO_API_KEY' },
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
		if (res.status === 401 || res.status === 403) return { httpError: 'unauthorized', status: res.status }
		if (!res.ok) return { httpError: 'http-' + res.status, status: res.status }
		let body
		try {
			body = await res.json()
		} catch {
			return { httpError: 'bad-json', status: res.status }
		}
		if (body && body.error) {
			return { httpError: String(body.error.message || body.error.type || 'provider-error'), status: res.status }
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
	return { percent, resetsAt: typeof w.resetsAt === 'string' ? w.resetsAt : null }
}

async function queryOpencodeGo(base, key) {
	const baseUrl = ((base || 'https://opencode.ai/zen/go').replace(/\/$/, ''))
	const { body, httpError } = await requestJson(baseUrl + '/v1/usage', {
		Authorization: 'Bearer ' + key,
		'x-api-key': key,
		Accept: 'application/json',
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
	})
	if (httpError) return { ok: false, error: httpError }
	const usage = body && body.usage ? body.usage : null
	if (!usage || typeof usage !== 'object') return { ok: false, error: 'missing-usage' }
	const windows = []
	for (const route of [['rolling', '5小时'], ['weekly', '7天'], ['monthly', '30天']]) {
		const key = route[0]
		const label = route[1]
		const w = pickOpencodeWindow(usage[key])
		if (!w) continue
		windows.push({ key, label, kind: 'percent', percent: w.percent, resetsAt: w.resetsAt, limitUsd: OPENCODE_LIMITS_USD[key] || null })
	}
	if (!windows.length) return { ok: false, error: 'missing-windows' }
	return { ok: true, windows }
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
	static inject = ['llm', 'credentials']

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
	 * 查询当前提供商的余量（余额/限额）。仅 DeepSeek 与 OpenCode Go 实际查询；
	 * 其余已识别的厂商回 supported:false + recognized:true，由客户端显示「暂不支持」。
	 * @param request - { provider, baseURL, apiKeyEnv } of the current provider route.
	 * @returns normalized payload.
	 */
	async balance(request) {
		const provider = request && request.provider
		const baseURL = request && request.baseURL
		const apiKeyEnv = request && request.apiKeyEnv
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
		const cacheKey = provider + '\n' + baseURL + '\n' + fam.env
		const now = Date.now()
		const hit = balanceCache.get(cacheKey)
		if (hit && now - hit.fetchedAt < BALANCE_CACHE_TTL_MS) return hit.value
		try {
			let result = null
			switch (fam.family) {
				case 'deepseek': result = await queryDeepSeek(baseURL, key); break
				case 'opencode-go': result = await queryOpencodeGo(baseURL, key); break
			}
			let value
			if (!result || !result.ok) {
				value = { supported: true, recognized: true, family: fam.family, kind: fam.kind, error: result ? result.error : 'unknown', balance: null, windows: null }
			} else {
				value = { supported: true, recognized: true, family: fam.family, kind: fam.kind, error: null, balance: result.balance || null, windows: result.windows || null, membership: result.membership || null }
			}
			balanceCache.set(cacheKey, { fetchedAt: now, value })
			return value
		} catch (e) {
			return { supported: true, recognized: true, family: fam.family, kind: fam.kind, error: e && e.message ? e.message : 'unknown', balance: null, windows: null }
		}
	}
}

export default ProviderBadgeService