import { OpenAIEmbeddings } from '@langchain/openai';
import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
	type ISupplyDataFunctions,
	type SupplyData,
} from 'n8n-workflow';

import {
	FREELLM_CREDENTIAL,
	createCustomModelEndpointConfig,
} from '@utils/custom-model-endpoint/gateway-config';
import { n8nContextHeaders } from '@utils/custom-model-endpoint/context-headers';

interface EmbeddingsOptions {
	timeout?: number;
	maxRetries?: number;
	dimensions?: number;
}

export class FreeLlmEmbeddings implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FreeLLM Embeddings',
		name: 'freeLlmEmbeddings',
		icon: {
			light: 'file:../../../icons/freellm.svg',
			dark: 'file:../../../icons/freellm.dark.svg',
		},
		group: ['transform'],
		version: [1],
		description: 'Generate embeddings using FreeLLM models',
		defaults: {
			name: 'FreeLLM Embeddings',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Embeddings', 'Root Nodes'],
				Embeddings: ['FreeLLM Embeddings'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://docs.freellm.com/integrations/n8n/embeddings',
					},
				],
			},
		},

		inputs: [],
		outputs: [NodeConnectionTypes.AiEmbedding],
		outputNames: ['Embeddings'],
		credentials: [
			{
				name: FREELLM_CREDENTIAL,
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				options: [
					{ name: 'text-embedding-3-large', value: 'text-embedding-3-large', description: 'Best quality, 3072 dimensions' },
					{ name: 'text-embedding-3-small', value: 'text-embedding-3-small', description: 'Good quality, 1536 dimensions' },
					{ name: 'text-embedding-ada-002', value: 'text-embedding-ada-002', description: 'Legacy, 1536 dimensions' },
				],
				default: 'text-embedding-3-small',
				description: 'The embedding model to use',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Dimensions',
						name: 'dimensions',
						type: 'number',
						default: -1,
						description: 'Number of dimensions (only for text-embedding-3 models). -1 = model default.',
						typeOptions: { minValue: -1 },
					},
					{
						displayName: 'Timeout (ms)',
						name: 'timeout',
						type: 'number',
						default: 60000,
						description: 'Request timeout in milliseconds',
						typeOptions: { minValue: 1000 },
					},
					{
						displayName: 'Max Retries',
						name: 'maxRetries',
						type: 'number',
						default: 2,
						description: 'Maximum retry attempts',
						typeOptions: { minValue: 0, maxValue: 10 },
					},
				],
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const credential = await this.getCredentials(FREELLM_CREDENTIAL);

		const model = this.getNodeParameter('model', itemIndex, 'text-embedding-3-small') as string;
		const options = this.getNodeParameter('options', itemIndex, {}) as EmbeddingsOptions;

		const { configuration } = createCustomModelEndpointConfig(this, credential, {
			credentialType: FREELLM_CREDENTIAL,
			timeout: options.timeout,
			contextHeaders: n8nContextHeaders(this),
			userHeaders: {},
		});

		const embeddings = new OpenAIEmbeddings({
			model,
			configuration,
			dimensions: options.dimensions ?? undefined,
			maxRetries: options.maxRetries ?? 2,
			apiKey: 'freellm',
		});

		return {
			response: embeddings,
		};
	}
}