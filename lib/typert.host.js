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
		}
	],
	model: {
		services: [
			{
				description: "Reads the current model's catalog info (context window, max tokens, input modalities).",
				summary: "Reads the current model's catalog info.",
				jsDoc: "/** Reads the current model's catalog info. */",
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
					}
				],
				types: []
			}
		],
		events: [],
		objects: []
	}
}
