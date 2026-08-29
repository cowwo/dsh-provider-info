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

// ---- 余量（余额/限额）schema ----
const balanceWindowSchema = z.object({
	key: z.string().nullable().optional(),
	label: z.string().nullable().optional(),
	kind: z.string().nullable().optional(),
	percent: z.number().nullable().optional(),
	utilization: z.number().nullable().optional(),
	limit: z.number().nullable().optional(),
	remaining: z.number().nullable().optional(),
	used: z.number().nullable().optional(),
	limitUsd: z.number().nullable().optional(),
	status: z.string().nullable().optional(),
	rateLimited: z.boolean().nullable().optional(),
	resetsAt: z.string().nullable().optional()
}).nullable()

const balanceInfoSchema = z.object({
	currency: z.string().nullable().optional(),
	total_balance: z.number().nullable().optional(),
	granted_balance: z.number().nullable().optional(),
	topped_up_balance: z.number().nullable().optional()
}).nullable()

const balancePayloadSchema = z.object({
	is_available: z.boolean().nullable().optional(),
	currency: z.string().nullable().optional(),
	total: z.number().nullable().optional(),
	used: z.number().nullable().optional(),
	remaining: z.number().nullable().optional(),
	balance_infos: z.array(balanceInfoSchema).nullable().optional()
}).nullable()

const balanceResultSchema = z.object({
	supported: z.boolean(),
	recognized: z.boolean().optional(),
	family: z.string().nullable().optional(),
	kind: z.string().nullable().optional(),
	error: z.string().nullable().optional(),
	membership: z.string().nullable().optional(),
	balance: balancePayloadSchema.optional(),
	windows: z.array(balanceWindowSchema).nullable().optional()
}).nullable()

const balanceRequestSchema = z.object({
	provider: z.string().min(1),
	baseURL: z.string().nullable().optional(),
	apiKeyEnv: z.string().nullable().optional()
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
						signature: 'async balance(request: { provider: string; baseURL?: string | null; apiKeyEnv?: string | null }): Promise<{ supported: boolean; recognized?: boolean; family?: string | null; kind?: string | null; error?: string | null; membership?: string | null; balance?: object | null; windows?: object[] | null } | null>',
						description: "Query the current provider's remaining balance or subscription limits.",
						summary: "Query the provider's remaining balance or limits.",
						jsDoc: "/** Query the provider's remaining balance or limits. */",
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