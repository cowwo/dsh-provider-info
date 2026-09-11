/* Hand-written typert host manifest for dsh-provider-info (strict face). */
import { z } from 'zod'

const modelInfoRequestSchema = z.object({
	provider: z.string().min(1),
	model: z.string().min(1)
})

const modelInfoResultSchema = z.object({
	contextWindow: z.number().int().positive().nullable().optional(),
	maxTokens: z.number().int().positive().nullable().optional(),
	input: z.array(z.string()).nullable().optional()
}).nullable()

// ---- 余量 schema（统一结构：windows / balance / period，见 ADR-0002）----
const balanceWindowSchema = z.object({
	key: z.string(),
	durationHours: z.number().nullable().optional(),
	percent: z.number().nullable().optional(),
	used: z.number().nullable().optional(),
	total: z.number().nullable().optional(),
	currency: z.string().nullable().optional(),
	resetsAt: z.string().nullable().optional(),
	rateLimited: z.boolean().nullable().optional()
})

const balanceItemSchema = z.object({
	currency: z.string().nullable().optional(),
	total: z.number().nullable().optional()
})

const balancePayloadSchema = z.object({
	isAvailable: z.boolean().nullable().optional(),
	items: z.array(balanceItemSchema).nullable().optional()
}).nullable()

const balancePeriodSchema = z.object({
	end: z.string().nullable().optional(),
	daysLeft: z.number().nullable().optional()
}).nullable()

const balanceResultSchema = z.object({
	supported: z.boolean(),
	recognized: z.boolean().optional(),
	family: z.string().nullable().optional(),
	error: z.string().nullable().optional(),
	// 余额型：币种 + 金额（可多币种）
	balance: balancePayloadSchema.optional(),
	// 套餐型：配额窗口（key = 语义槽位，durationHours = 真实时长，used/total = 已用与总额）
	windows: z.array(balanceWindowSchema).nullable().optional(),
	// 套餐型：订阅计费周期到期（只有厂商提供时才有）
	period: balancePeriodSchema.optional()
}).nullable()

const balanceRequestSchema = z.object({
	provider: z.string().min(1),
	baseURL: z.string().nullable().optional(),
	apiKeyEnv: z.string().nullable().optional(),
	force: z.boolean().nullable().optional()
})

const settingsSchema = z.object({
	hoverRefresh: z.boolean().nullable().optional(),
	autoRefreshOn: z.boolean().nullable().optional(),
	autoRefreshMin: z.number().nullable().optional(),
	showMore: z.boolean().nullable().optional(),
	fontSize: z.enum(['large', 'middle', 'small']).nullable().optional(),
	language: z.enum(['system', 'en', 'zh']).nullable().optional()
})

const settingsRequestSchema = z.object({
	op: z.enum(['get', 'set']),
	patch: z.object({
		hoverRefresh: z.boolean().optional(),
		autoRefreshOn: z.boolean().optional(),
		autoRefreshMin: z.number().optional(),
		showMore: z.boolean().optional(),
		fontSize: z.enum(['large', 'middle', 'small']).optional(),
		language: z.enum(['system', 'en', 'zh']).optional()
	}).optional()
})

const settingsResultSchema = z.object({
	settings: settingsSchema
})

// ---- 提供商枚举 schema ----
const providerEntrySchema = z.object({
	provider: z.string(),
	displayName: z.string().nullable().optional(),
	baseURL: z.string().nullable().optional(),
	apiKeyEnv: z.string().nullable().optional()
})
const providersRequestSchema = z.object({}).strict()
const providersResultSchema = z.object({
	providers: z.array(providerEntrySchema)
})

export const TYPERT = {
	package: 'dsh-provider-info',
	face: 'host',
	schemas: [],
	invocations: [
		{
			id: 'dsh-provider-info#providerBadge/modelInfo',
			service: 'providerBadge',
			namespace: 'providerBadge',
			method: 'modelInfo',
			invocation: { kind: 'direct' },
			parameters: [
				{
					name: 'request',
					wire: 'request',
					source: 'json',
					codec: {
						mode: 'strict',
						typeSymbol: 'dsh-provider-info#providerBadge/modelInfo:request',
						schema: modelInfoRequestSchema
					}
				}
			],
			result: {
				mode: 'strict',
				typeSymbol: 'dsh-provider-info#providerBadge/modelInfo:result',
				schema: modelInfoResultSchema
			},
			sourceLocation: { file: 'lib/index.js', line: 1, column: 1 }
		},
		{
			id: 'dsh-provider-info#providerBadge/balance',
			service: 'providerBadge',
			namespace: 'providerBadge',
			method: 'balance',
			invocation: { kind: 'direct' },
			parameters: [
				{
					name: 'request',
					wire: 'request',
					source: 'json',
					codec: {
						mode: 'strict',
						typeSymbol: 'dsh-provider-info#providerBadge/balance:request',
						schema: balanceRequestSchema
					}
				}
			],
			result: {
				mode: 'strict',
				typeSymbol: 'dsh-provider-info#providerBadge/balance:result',
				schema: balanceResultSchema
			},
			sourceLocation: { file: 'lib/index.js', line: 1, column: 1 }
		},
		{
			id: 'dsh-provider-info#providerBadge/settings',
			service: 'providerBadge',
			namespace: 'providerBadge',
			method: 'settings',
			invocation: { kind: 'direct' },
			parameters: [
				{
					name: 'request',
					wire: 'request',
					source: 'json',
					codec: {
						mode: 'strict',
						typeSymbol: 'dsh-provider-info#providerBadge/settings:request',
						schema: settingsRequestSchema
					}
				}
			],
			result: {
				mode: 'strict',
				typeSymbol: 'dsh-provider-info#providerBadge/settings:result',
				schema: settingsResultSchema
			},
			sourceLocation: { file: 'lib/index.js', line: 1, column: 1 }
		},
		{
			id: 'dsh-provider-info#providerBadge/providers',
			service: 'providerBadge',
			namespace: 'providerBadge',
			method: 'providers',
			invocation: { kind: 'direct' },
			parameters: [
				{
					name: 'request',
					wire: 'request',
					source: 'json',
					codec: {
						mode: 'strict',
						typeSymbol: 'dsh-provider-info#providerBadge/providers:request',
						schema: providersRequestSchema
					}
				}
			],
			result: {
				mode: 'strict',
				typeSymbol: 'dsh-provider-info#providerBadge/providers:result',
				schema: providersResultSchema
			},
			sourceLocation: { file: 'lib/index.js', line: 1, column: 1 }
		}
	],
	model: {
		services: [
			{
				description: "Reads the current model's catalog info (context window, max tokens, input modalities) and the current provider's remaining quota (balance or subscription limits).",
				summary: "Reads the current model's catalog info and the provider's remaining quota.",
				jsDoc: "/** Reads the current model's catalog info and the provider's remaining quota. */",
				tags: [],
				key: 'providerBadge',
				exportName: 'ProviderBadgeService',
				members: [
					{
						kind: 'method',
						name: 'modelInfo',
						signature: 'async modelInfo(request: { provider: string; model: string }): Promise<{ contextWindow?: number | null; maxTokens?: number | null; input?: string[] | null } | null>',
						description: "Resolve a model's catalog info.",
						summary: "Resolve a model's catalog info.",
						jsDoc: "/** Resolve a model's catalog info. */",
						tags: []
					},
					{
						kind: 'method',
						name: 'balance',
						signature: 'async balance(request: { provider: string; baseURL?: string | null; apiKeyEnv?: string | null }): Promise<{ supported: boolean; recognized?: boolean; family?: string | null; error?: string | null; balance?: object | null; windows?: object[] | null; period?: object | null } | null>',
						description: "Query the current provider's remaining balance or subscription limits.",
						summary: "Query the provider's remaining balance or limits.",
						jsDoc: "/** Query the provider's remaining balance or limits. */",
						tags: []
					},
					{
						kind: 'method',
						name: 'settings',
						signature: 'async settings(request: { op: string; patch?: object }): Promise<{ settings: { hoverRefresh?: boolean | null; autoRefreshOn?: boolean | null; autoRefreshMin?: number | null; showMore?: boolean | null; fontSize?: string | null; language?: string | null } }>',
						description: "Read or write the plugin's quota-refresh settings.",
						summary: "Read or write the plugin settings.",
						jsDoc: "/** Read or write the plugin settings. */",
						tags: []
					}
				],
				types: []
			}
		],
		events: [],
		objects: []
	}
}