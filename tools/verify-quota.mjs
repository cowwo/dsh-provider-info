/**
 * 余量统一结构的实测脚本（开发期用，不参与插件运行）：
 * 用本机真实凭据调用三家适配器，并把结果过一遍 typert 的严格 schema，
 * 确保「host 吐什么」与「RPC 校验接受什么」一致。
 *
 * 用法：node tools/verify-quota.mjs
 */
import fs from 'node:fs'
import ProviderBadgeService from '../lib/index.js'
import { TYPERT } from '../lib/typert.host.js'

const credsPath = (process.env.DSH_HOME || process.env.HOME + '/.dsh') + '/.credentials.yaml'
const raw = fs.readFileSync(credsPath, 'utf8')
const cred = (name) => {
	const m = raw.match(new RegExp('^  ' + name + ':[ \\t]*(\\S+)', 'm'))
	return m ? m[1] : null
}

// cordis 的 Service 构造需要 ctx.reflect 等基础设施；这里给一个「什么都不做」的替身，
// 只为把 service.balance() 的适配器逻辑跑起来（不启动 DSH）。
const noop = () => {}
const reflectStub = new Proxy({}, { get: () => noop })
const base = {
	credentials: { resolve: async (name) => { const v = cred(name); return v ? { value: v } : null } },
	settings: { describe: () => [] },
	llm: {}
}
const ctx = new Proxy(base, {
	get: (target, prop) => {
		if (prop in target) return target[prop]
		if (prop === 'reflect') return reflectStub
		return noop
	}
})
const service = new ProviderBadgeService(ctx, {})

const balanceSchema = TYPERT.invocations.find((i) => i.method === 'balance').result.schema

const cases = [
	{ label: 'deepseek（余额型）', provider: 'deepseek', baseURL: 'https://api.deepseek.com', apiKeyEnv: 'DEEPSEEK_API_KEY' },
	{ label: 'og-01（套餐型 5h/周/月）', provider: 'og-01', baseURL: 'https://opencode.ai/zen/go/v1', apiKeyEnv: 'OG_01_API_KEY' },
	{ label: 'cmd-01（套餐型 + 到期）', provider: 'cmd-01', baseURL: 'https://api.commandcode.ai/provider/v1', apiKeyEnv: 'CMD_01_API_KEY' },
	{ label: 'kimi（已识别但不支持查询）', provider: 'kimi-coding', baseURL: 'https://api.kimi.com', apiKeyEnv: 'KIMI_CODING_API_KEY' },
	{ label: '未知厂商（未识别）', provider: 'local-llm', baseURL: 'http://127.0.0.1:11434/v1', apiKeyEnv: null }
]

let failed = 0
for (const c of cases) {
	const result = await service.balance({ provider: c.provider, baseURL: c.baseURL, apiKeyEnv: c.apiKeyEnv, force: true })
	const parsed = balanceSchema.safeParse(result)
	const verdict = parsed.success ? 'schema OK' : 'schema FAIL: ' + JSON.stringify(parsed.error.issues.slice(0, 4))
	if (!parsed.success) failed++
	console.log('\n### ' + c.label + '  →  ' + verdict)
	console.log(JSON.stringify(result, null, 1))
}
console.log('\n' + (failed ? failed + ' case(s) FAILED schema' : 'all cases pass strict schema'))
process.exit(failed ? 1 : 0)
