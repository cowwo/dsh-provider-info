/**
 * 渲染文案的实测脚本（开发期用，不参与插件运行）：
 * 从 client/client.js 里**原样抽取**「余量数据 → 统一文案」这段真实源码执行，
 * 输入真实/代表性数据，打印浮层与设置页表格将要显示的每一格文字并做断言。
 * 这样格式逻辑不靠人肉阅读，也不靠复制一份实现来"测试自己"。
 *
 * 用法：node tools/verify-format.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const src = fs.readFileSync(path.join(here, '../client/client.js'), 'utf8')

const start = src.indexOf('//#region 余量数据 → 统一文案')
const end = src.indexOf('//#endregion', start)
if (start < 0 || end < 0) throw new Error('找不到 client.js 里的文案 region 标记')
const region = src.slice(start, end)

const dict = {
	'quota.win.rolling': '5小时',
	'quota.win.weekly': '周',
	'quota.win.monthly': '月',
	balance: '余量',
	balanceName: '余额',
	window: '窗口',
	expiresOn: '到期',
	leftDays: '剩',
	daysUnit: '天',
	insufficient: '（余额不足）',
	rateLimited: '已限流',
	noData: '无数据',
	noSupportProvider: '当前暂不支持查询当前提供商',
	noApiKey: '未配置 API Key',
	queryFailed: '查询失败',
	missingUsage: '接口无用量数据'
}
const tx = (k) => (dict[k] != null ? dict[k] : k)
const resolveLang = () => 'zh'

// eslint-disable-next-line no-new-func
const api = new Function('tx', 'resolveLang', region + `
	return { windowLabel, windowValue, balanceValue, periodValue, quotaErrorText, quotaStatusText, hasQuotaData, sortedWindows };
`)(tx, resolveLang)

let failed = 0
const check = (what, actual, expected) => {
	const ok = actual === expected
	if (!ok) failed++
	console.log((ok ? '  ok   ' : '  FAIL ') + what + '  =>  ' + JSON.stringify(actual) + (ok ? '' : '   (期望 ' + JSON.stringify(expected) + ')'))
}
/** 只比较「· 倒计时」之前的部分（倒计时随当前时间变化）。 */
const beforeCountdown = (s) => String(s).split(' · ')[0]

// ---- 真实返回样本（来自 tools/verify-quota.mjs 的实测输出）----
const deepseek = {
	supported: true, recognized: true, family: 'deepseek', error: null,
	balance: { isAvailable: true, items: [{ currency: 'USD', total: 0 }, { currency: 'CNY', total: 20.38 }] },
	windows: null, period: null
}
const opencodeGo = {
	supported: true, recognized: true, error: null,
	balance: null, period: null,
	windows: [
		{ key: 'monthly', durationHours: 720, percent: 72, used: 43.2, total: 60, currency: 'USD', resetsAt: '2026-09-24T03:57:53.511Z', rateLimited: false },
		{ key: 'rolling', durationHours: 5, percent: 2, used: 0.24, total: 12, currency: 'USD', resetsAt: '2026-09-11T12:42:53.511Z', rateLimited: false },
		{ key: 'weekly', durationHours: 168, percent: 1, used: 0.3, total: 30, currency: 'USD', resetsAt: '2026-09-14T00:00:00.511Z', rateLimited: false }
	]
}
const commandCode = {
	supported: true, recognized: true, error: null, balance: null,
	period: { end: '2026-10-08T03:34:45.000Z', daysLeft: 27 },
	windows: [
		{ key: 'rolling', durationHours: 5, percent: 5.09, used: 0.71, total: 14, currency: 'USD', resetsAt: '2026-09-11T10:56:21.810Z', rateLimited: false },
		{ key: 'weekly', durationHours: 168, percent: 22.07, used: 7.72, total: 35, currency: 'USD', resetsAt: '2026-09-15T09:02:12.735Z', rateLimited: false },
		{ key: 'monthly', durationHours: 720, percent: 9.94, used: 6.96, total: 70, currency: 'USD', resetsAt: '2026-10-08T03:34:45.000Z', rateLimited: false }
	]
}
const kimi = { supported: false, recognized: true, family: 'kimi', error: 'not-supported', balance: null, windows: null, period: null }
const unknown = { supported: false, recognized: false, family: null, error: null, balance: null, windows: null, period: null }

console.log('\n【浮层：deepseek】')
check('行标签', '余额', dict.balanceName)
check('行内容', api.balanceValue(deepseek.balance), '¥20.38 / $0.00')

console.log('\n【浮层：og-01（窗口顺序必须按真实时长排：5小时→周→月），显示更多信息=开】')
const ogSorted = api.sortedWindows(opencodeGo)
check('窗口顺序', ogSorted.map((w) => w.key).join(','), 'rolling,weekly,monthly')
check('5小时 行', api.windowLabel(ogSorted[0]), '5小时')
check('5小时 值', beforeCountdown(api.windowValue(ogSorted[0], { more: true, countdown: true, period: opencodeGo.period })), '2.00%（$0.24/$12.00）')
check('周 值', beforeCountdown(api.windowValue(ogSorted[1], { more: true, countdown: true, period: opencodeGo.period })), '1.00%（$0.30/$30.00）')
check('月 值', beforeCountdown(api.windowValue(ogSorted[2], { more: true, countdown: true, period: opencodeGo.period })), '72.00%（$43.20/$60.00）')
check('og 没有到期行', api.periodValue(opencodeGo.period, { more: true }), '')

console.log('\n【浮层：cmd-01（月行不得重复显示与「到期」相同的倒计时），显示更多信息=开】')
const ccSorted = api.sortedWindows(commandCode)
check('月 值（无倒计时）', api.windowValue(ccSorted[2], { more: true, countdown: true, period: commandCode.period }), '9.94%（$6.96/$70.00）')
check('5小时 值附倒计时', beforeCountdown(api.windowValue(ccSorted[0], { more: true, countdown: true, period: commandCode.period })), '5.09%（$0.71/$14.00）')
check('到期 行', api.periodValue(commandCode.period, { more: true }).split(' · ')[0], '2026-10-08')

console.log('\n【显示更多信息=关（默认）：只留比例数字与到期日期】')
check('不传选项也默认关（调用处漏传也安全）', api.windowValue(ogSorted[0]), '2.00%')
check('浮层窗口行只剩百分比', api.windowValue(ogSorted[0], { more: false, countdown: true, period: opencodeGo.period }), '2.00%')
check('表格窗口格只剩百分比', api.windowValue(ccSorted[2], { more: false, countdown: false }), '9.94%')
check('到期只剩日期', api.periodValue(commandCode.period, { more: false }), '2026-10-08')
check('余额型不受影响', api.balanceValue(deepseek.balance), '¥20.38 / $0.00')
check('「已限流」是状态警告，不随开关隐藏', api.windowValue({ key: 'rolling', percent: 5, rateLimited: true }, { more: false, countdown: true }), '5.00% 已限流')

console.log('\n【设置页表格：套餐型没有「余额」格（余额列只服务充值型）】')
check('og 余额格', api.balanceValue(opencodeGo.balance), '')
check('cmd 余额格', api.balanceValue(commandCode.balance), '')
check('deepseek 到期格', api.periodValue(deepseek.period, { more: true }), '')

console.log('\n【查不了的厂商：状态跟在名称后，不占数据列】')
check('kimi 状态文案', api.quotaStatusText(kimi), '当前暂不支持查询当前提供商')
check('kimi 是否显示该行', api.hasQuotaData(kimi), true)
check('未识别厂商收起态隐藏', api.hasQuotaData(unknown), false)
check('未识别厂商状态文案', api.quotaStatusText(unknown), '当前暂不支持查询当前提供商')

console.log('\n【余额不足后缀】')
check('余额不足', api.balanceValue({ isAvailable: false, items: [{ currency: 'CNY', total: 0 }] }), '¥0.00（余额不足）')

console.log('\n' + (failed ? failed + ' 项不符' : '全部符合预期'))
process.exit(failed ? 1 : 0)
