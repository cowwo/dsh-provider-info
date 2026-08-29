import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
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
 * 回退到 route key / 凭据环境变量名里的家族标志。以下均为各提供商官方
 * （或未入公开文档但已被社区验证）的用量/余额接口。
 */

// 官方订阅限额常量（美元），接口只回已用百分比 + 重置时间，金额按此换算。
const OPENCODE_LIMITS_USD = { rolling: 12, weekly: 30, monthly: 60 }

const FAMILY_MARKERS = [
	{ family: 'deepseek', kind: 'balance', markers: ['api.deepseek.com', 'deepseek'], env: 'DEEPSEEK_API_KEY' },
	{ family: 'opencode-go', kind: 'limits', markers: ['opencode.ai', 'opencode-go', 'opencode'], env: 'OPENCODE_GO_API_KEY' },
	{ family: 'kimi', kind: 'limits', markers: ['api.kimi.com', 'kimi'], env: 'KIMI_CODING_API_KEY' },
	{ family: 'zhipu', kind: 'limits', markers: ['open.bigmodel.cn', 'api.z.ai', 'zai', 'bigmodel'], env: 'ZAI_API_KEY' },
	{ family: 'minimax', kind: 'limits', markers: ['api.minimaxi.com', 'api.minimax.io', 'minimax'], env: 'MINIMAX_API_KEY' },
	{ family: 'openrouter', kind: 'balance', markers: ['openrouter.ai', 'openrouter'], env: 'OPENROUTER_API_KEY' },
	{ family: 'codex', kind: 'limits', markers: ['chatgpt.com', 'openai-codex', 'codex'], env: 'OPENAI_CODEX_ACCESS_TOKEN' }
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
	for (const [key, label] of [['rolling', '5小时'], ['weekly', '7天'], ['monthly', '30天']]) {
		const w = pickOpencodeWindow(usage[key])
		if (!w) continue
		windows.push({ key, label, kind: 'percent', percent: w.percent, resetsAt: w.resetsAt, limitUsd: OPENCODE_LIMITS_USD[key] || null })
	}
	if (!windows.length) return { ok: false, error: 'missing-windows' }
	return { ok: true, windows }
}

// Kimi Coding：5h（limits[0].detail）+ 周（usage）。
async function queryKimi(base, key) {
	const baseUrl = ((base || 'https://api.kimi.com/coding').replace(/\/$/, ''))
	const { body, httpError } = await requestJson(baseUrl + '/v1/usages', {
		Authorization: 'Bearer ' + key,
		Accept: 'application/json',
		'User-Agent': 'KimiCLI/1.5'
	})
	if (httpError) return { ok: false, error: httpError }
	const makeTier = (limitRaw, remainingRaw, resetsAt) => {
		const limit = toNum(limitRaw)
		const remaining = toNum(remainingRaw)
		const used = limit !== null && remaining !== null ? Math.max(limit - remaining, 0) : null
		const utilization = limit !== null && limit > 0 && used !== null ? (used / limit) * 100 : null
		return { limit, remaining, used, utilization, resetsAt: typeof resetsAt === 'string' ? resetsAt : null }
	}
	const limits = Array.isArray(body && body.limits) ? body.limits : []
	const first = limits[0]
	const detail = first && first.detail ? first.detail : null
	const usage = body && body.usage ? body.usage : null
	const windows = []
	if (detail) windows.push({ key: 'five-hour', label: '5小时', kind: 'tier', ...makeTier(detail.limit, detail.remaining, detail.resetTime) })
	if (usage) windows.push({ key: 'weekly', label: '7天', kind: 'tier', ...makeTier(usage.limit, usage.remaining, usage.resetTime) })
	if (!windows.length) return { ok: false, error: 'missing-windows' }
	return { ok: true, windows, membership: body && body.user && body.user.membership && typeof body.user.membership.level === 'string' ? body.user.membership.level : null }
}

// 智谱 GLM Coding Plan：limits[] 里 type=TOKENS_LIMIT 的条目，unit 3=5h、6=周。
async function queryZhipu(base, key) {
	const baseUrl = ((base || 'https://open.bigmodel.cn').replace(/\/$/, ''))
	const { body, httpError } = await requestJson(baseUrl + '/api/monitor/usage/quota/limit', {
		Authorization: key,
		'Content-Type': 'application/json',
		'Accept-Language': 'en-US,en',
		Accept: 'application/json'
	})
	if (httpError) return { ok: false, error: httpError }
	const data = body && body.data ? body.data : null
	if (!data || typeof data !== 'object') return { ok: false, error: 'missing-data' }
	const limits = Array.isArray(data.limits) ? data.limits : []
	let fiveHour = null
	let weekly = null
	const unclassified = []
	for (const item of limits) {
		if (!item || typeof item !== 'object') continue
		if (String(item.type || '').toLowerCase() !== 'tokens_limit') continue
		const resetMs = toNum(item.nextResetTime)
		const entry = { utilization: toNum(item.percentage), resetsAt: resetMs !== null ? new Date(resetMs).toISOString() : null }
		const unit = toNum(item.unit)
		if (unit === 3 && !fiveHour) fiveHour = entry
		else if (unit === 6 && !weekly) weekly = entry
		else unclassified.push(entry)
	}
	unclassified.sort((a, b) => {
		if (a.resetsAt === null && b.resetsAt === null) return 0
		if (a.resetsAt === null) return 1
		if (b.resetsAt === null) return -1
		return Date.parse(a.resetsAt) - Date.parse(b.resetsAt)
	})
	for (const e of unclassified) {
		if (!fiveHour) fiveHour = e
		else if (!weekly) weekly = e
	}
	const windows = []
	if (fiveHour) windows.push({ key: 'five-hour', label: '5小时', kind: 'percent', percent: fiveHour.utilization, resetsAt: fiveHour.resetsAt })
	if (weekly) windows.push({ key: 'weekly', label: '7天', kind: 'percent', percent: weekly.utilization, resetsAt: weekly.resetsAt })
	if (!windows.length) return { ok: false, error: 'missing-windows' }
	return { ok: true, windows }
}

// MiniMax Coding Plan：model_remains[] general 条目给剩余百分比，已用=100-剩余。
async function queryMiniMax(base, key) {
	const baseUrl = ((base || 'https://api.minimaxi.com').replace(/\/$/, ''))
	const { body, httpError } = await requestJson(baseUrl + '/v1/api/openplatform/coding_plan/remains', {
		Authorization: 'Bearer ' + key,
		'Content-Type': 'application/json',
		Accept: 'application/json'
	})
	if (httpError) return { ok: false, error: httpError }
	const br = body && body.base_resp ? body.base_resp : null
	if (br && toNum(br.status_code) !== 0) return { ok: false, error: String((br && br.status_msg) || 'provider-error') }
	const remains = Array.isArray(body && body.model_remains) ? body.model_remains : []
	const item = remains.find((m) => m && m.model_name === 'general')
	if (!item || typeof item !== 'object') return { ok: false, error: 'missing-general' }
	const windows = []
	const fiveRemain = toNum(item.current_interval_remaining_percent)
	const endMs = toNum(item.end_time)
	if (fiveRemain !== null) windows.push({ key: 'five-hour', label: '5小时', kind: 'percent', percent: 100 - fiveRemain, resetsAt: endMs !== null ? new Date(endMs).toISOString() : null })
	if (toNum(item.current_weekly_status) === 1) {
		const weeklyRemain = toNum(item.current_weekly_remaining_percent)
		const weeklyEndMs = toNum(item.weekly_end_time)
		if (weeklyRemain !== null) windows.push({ key: 'weekly', label: '7天', kind: 'percent', percent: 100 - weeklyRemain, resetsAt: weeklyEndMs !== null ? new Date(weeklyEndMs).toISOString() : null })
	}
	if (!windows.length) return { ok: false, error: 'missing-windows' }
	return { ok: true, windows }
}

// OpenRouter：充值余额，剩余 = 总额 - 已用。
async function queryOpenRouter(base, key) {
	const baseUrl = ((base || 'https://openrouter.ai').replace(/\/$/, ''))
	const { body, httpError } = await requestJson(baseUrl + '/api/v1/credits', {
		Authorization: 'Bearer ' + key,
		Accept: 'application/json'
	})
	if (httpError) return { ok: false, error: httpError }
	const data = body && body.data ? body.data : null
	if (!data || typeof data !== 'object') return { ok: false, error: 'missing-data' }
	const total = toNum(data.total_credits)
	const used = toNum(data.total_usage)
	return {
		ok: true,
		balance: {
			currency: 'USD',
			total,
			used,
			remaining: total !== null && used !== null ? Math.max(total - used, 0) : null
		}
	}
}

// OpenAI Codex：订阅窗口（primary/secondary_window）。
function codexWindowName(secs) {
	if (secs === 18000) return { label: '5小时', key: 'five-hour' }
	if (secs === 604800) return { label: '7天', key: 'weekly' }
	if (secs === 2592000) return { label: '30天', key: 'monthly' }
	const hours = Math.floor(secs / 3600)
	if (hours >= 24) return { label: Math.floor(hours / 24) + '天', key: 'daily' }
	return { label: hours + '小时', key: 'other' }
}

async function queryCodex(base, key, accountId) {
	const baseUrl = ((base || 'https://chatgpt.com').replace(/\/$/, ''))
	const headers = {
		Authorization: 'Bearer ' + key,
		'User-Agent': 'codex-cli',
		Accept: 'application/json'
	}
	if (accountId) headers['ChatGPT-Account-Id'] = accountId
	const { body, httpError } = await requestJson(baseUrl + '/backend-api/wham/usage', headers)
	if (httpError) return { ok: false, error: httpError }
	const rl = body && body.rate_limit ? body.rate_limit : null
	const windows = []
	for (const win of [rl && rl.primary_window, rl && rl.secondary_window]) {
		if (!win || typeof win !== 'object') continue
		const used = toNum(win.used_percent)
		if (used === null) continue
		const secs = toNum(win.limit_window_seconds)
		const name = codexWindowName(secs !== null ? secs : 0)
		const resetSecs = toNum(win.reset_at)
		windows.push({ key: name.key, label: name.label, kind: 'percent', percent: used, resetsAt: resetSecs !== null ? new Date(resetSecs * 1000).toISOString() : null })
	}
	if (!windows.length) return { ok: false, error: 'missing-windows' }
	return { ok: true, windows }
}

// 凭据环境变量族：family 已定时，优先用 profile 的 apiKeyEnv，缺失时回退家族 env。
async function resolveKey(ctx, apiKeyEnv, familyEnv) {
	const candidates = []
	if (apiKeyEnv && typeof apiKeyEnv === 'string' && apiKeyEnv.length > 0) candidates.push(apiKeyEnv)
	if (familyEnv && familyEnv !== apiKeyEnv) candidates.push(familyEnv)
	for (const name of candidates) {
		try {
			const resolved = await ctx.credentials.resolve(credentialRef(name))
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
	 * 查询当前提供商的余量（余额/限额）。
	 * @param request - { provider, baseURL, apiKeyEnv } of the current provider route.
	 * @returns normalized payload: { supported, family, kind, error, balance?, windows? }.
	 */
	async balance(request) {
		const provider = request && request.provider
		const baseURL = request && request.baseURL
		const apiKeyEnv = request && request.apiKeyEnv
		if (!provider) throw new Error('providerBadge/balance: provider is required')
		const fam = detectFamily(baseURL, provider)
		if (!fam) return { supported: false, family: null, kind: null, error: null, balance: null, windows: null }
		const { key } = await resolveKey(this.ctx, apiKeyEnv, fam.env)
		if (!key) return { supported: true, family: fam.family, kind: fam.kind, error: 'no-api-key', balance: null, windows: null }
		try {
			let result = null
			switch (fam.family) {
				case 'deepseek': result = await queryDeepSeek(baseURL, key); break
				case 'opencode-go': result = await queryOpencodeGo(baseURL, key); break
				case 'kimi': result = await queryKimi(baseURL, key); break
				case 'zhipu': result = await queryZhipu(baseURL, key); break
				case 'minimax': result = await queryMiniMax(baseURL, key); break
				case 'openrouter': result = await queryOpenRouter(baseURL, key); break
				case 'codex': {
					let accountId = null
					try {
						const acc = await this.ctx.credentials.resolve(credentialRef('OPENAI_CODEX_ACCOUNT_ID'))
						if (acc && acc.value) accountId = acc.value
					} catch { /* 可选 */ }
					result = await queryCodex(baseURL, key, accountId)
					break
				}
			}
			if (!result || !result.ok) {
				return { supported: true, family: fam.family, kind: fam.kind, error: result ? result.error : 'unknown', balance: null, windows: null }
			}
			return { supported: true, family: fam.family, kind: fam.kind, error: null, balance: result.balance || null, windows: result.windows || null, membership: result.membership || null }
		} catch (e) {
			return { supported: true, family: fam.family, kind: fam.kind, error: e && e.message ? e.message : 'unknown', balance: null, windows: null }
		}
	}
}

export default ProviderBadgeService