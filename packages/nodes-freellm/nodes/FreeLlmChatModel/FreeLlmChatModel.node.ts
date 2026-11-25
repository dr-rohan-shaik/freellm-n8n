import { ChatOpenAI, ChatOpenAICompletions, type ChatOpenAIFields } from '@langchain/openai';
import {
	getConnectionHintNoticeField,
	makeN8nLlmFailedAttemptHandler,
	N8nLlmTracing,
} from '@n8n/ai-utilities';
import {
	NodeConnectionTypes,
	type IDataObject,
	type INodeType,
	type INodeTypeDescription,
	type ISupplyDataFunctions,
	type SupplyData,
} from 'n8n-workflow';

import { parseExtraBody } from '../shared/extra-body';

import { wrapChatModelMessageInput } from '@utils/chatModelMessageWrapper';
import { n8nContextHeaders } from '@utils/custom-model-endpoint/context-headers';
import {
	createCustomModelEndpointConfig,
	FREELLM_CREDENTIAL,
	modelField,
	chatModelOptions,
	requestHeaderFields,
	apiFormatField,
	CHAT_COMPLETIONS_FORMAT,
	RESPONSES_FORMAT,
	responsesFormatNotice,
	SEARCH_ALIASES,
} from '@utils/custom-model-endpoint/gateway-config';
import { toHeaderRecord } from '@utils/custom-model-endpoint/headers';
import { searchModels } from '@utils/custom-model-endpoint/models';

interface Options {
	maxTokens?: number;
	maxOutputTokens?: number;
	frequencyPenalty?: number;
	presencePenalty?: number;
	temperature?: number;
	topP?: number;
	seed?: number;
	stop?: string;
	timeout?: number;
	maxRetries?: number;
	reasoningSummary?: string;
	storeResponse?: boolean;
	truncation?: string;
}

const RETRYABLE = new Set([408, 429]);

function shouldRetry(status: number): boolean {
	return RETRYABLE.has(status) || status >= 500;
}

function responsesKwargs(options: Options): Record<string, unknown> {
	return {
		...(options.reasoningSummary ? { reasoning: { summary: options.reasoningSummary } } : {}),
		...(options.storeResponse === undefined ? {} : { store: options.storeResponse }),
		...(options.truncation ? { truncation: options.truncation } : {}),
	};
}

function nameTransportFault(error: unknown): void {
	if (typeof error !== 'object' || error === null || typeof (error as Record<string, unknown>).message !== 'string') return;
	if ((error as Record<string, unknown>).message !== 'Connection error.') return;

	const code = typeof (error as Record<string, unknown>).cause === 'object' && (error as Record<string, unknown>).cause !== null
		? ( (error as Record<string, unknown>).cause as Record<string, unknown> ).code
		: undefined;
	if (typeof code !== 'string') return;

	(error as Record<string, unknown>).message = `Connection error (${code})`;
}

function modelKwargsFor(
	ctx: ISupplyDataFunctions,
	options: Options,
	extraBody: unknown,
	itemIndex: number,
	usesResponses: boolean,
): Record<string, unknown> | undefined {
	const kwargs: Record<string, unknown> = usesResponses ? responsesKwargs(options) : {};
	if (!usesResponses && options.seed !== undefined) kwargs.seed = options.seed;

	const hasExtraBody = typeof extraBody === 'string' ? extraBody.trim() !== '' : Boolean(extraBody);
	if (hasExtraBody) Object.assign(kwargs, parseExtraBody(ctx, extraBody, itemIndex));

	return Object.keys(kwargs).length > 0 ? kwargs : undefined;
}

function limitOrUnset(value: number | undefined): number | undefined {
	return value !== undefined && value > 0 ? value : undefined;
}

export class FreeLlmChatModel implements INodeType {
	methods = {
		listSearch: {
			searchModels,
		},
	};

	description: INodeTypeDescription = {
		displayName: 'FreeLLM Chat Model',
		name: 'freeLlmChatModel',
		icon: {
			light: 'file:../../../icons/freellm.svg',
			dark: 'file:../../../icons/freellm.dark.svg',
		},
		group: ['transform'],
		version: [1],
		description: 'Chat with FreeLLM models (GPT-4o, GPT-4, Claude, Llama, and more)',
		defaults: {
			name: 'FreeLLM Chat Model',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Language Models', 'Root Nodes'],
				'Language Models': ['Chat Models (Recommended)'],
			},
			alias: SEARCH_ALIASES,
			resources: {
				primaryDocumentation: [
					{
						url: 'https://docs.freellm.com/integrations/n8n',
					},
				],
			},
		},

		inputs: [],
		outputs: [NodeConnectionTypes.AiLanguageModel],
		outputNames: ['Model'],
		credentials: [
			{
				name: FREELLM_CREDENTIAL,
				required: true,
			},
		],
		properties: [
			getConnectionHintNoticeField([NodeConnectionTypes.AiChain, NodeConnectionTypes.AiAgent]),
			modelField,
			apiFormatField,
			responsesFormatNotice,
			...requestHeaderFields,
			chatModelOptions,
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const credential = await this.getCredentials(FREELLM_CREDENTIAL);

		const model = this.getNodeParameter('model', itemIndex, '', {
			extractValue: true,
		}) as string;

		const options = this.getNodeParameter('options', itemIndex, {}) as Options;
		const usesResponses =
			this.getNodeParameter('apiFormat', itemIndex, CHAT_COMPLETIONS_FORMAT) === RESPONSES_FORMAT;
		const sendContextHeaders = this.getNodeParameter(
			'sendContextHeaders',
			itemIndex,
			true,
		) as boolean;
		const headerRows = this.getNodeParameter('headers.header', itemIndex, []) as IDataObject[];
		const extraBody: unknown = this.getNodeParameter('extraBody', itemIndex, '');

		const userHeaders = toHeaderRecord(
			Object.fromEntries(
				headerRows.flatMap(({ name, value }) => {
					const headerName = String(name ?? '').trim();
					return headerName ? [[headerName, value]] : [];
				}),
			),
		);

		const { configuration } = createCustomModelEndpointConfig(this, credential, {
			credentialType: FREELLM_CREDENTIAL,
			timeout: options.timeout,
			contextHeaders: sendContextHeaders ? n8nContextHeaders(this) : {},
			userHeaders,
		});

		const fields: ChatOpenAIFields = {
			apiKey: 'freellm',
			model: model || (credential.defaultModel as string) || 'freellm-gpt-4o',
			configuration,
			maxTokens: limitOrUnset(usesResponses ? options.maxOutputTokens : options.maxTokens),
			temperature: options.temperature,
			topP: options.topP,
			timeout: options.timeout,
			maxRetries: options.maxRetries ?? 2,
			modelKwargs: modelKwargsFor(this, options, extraBody, itemIndex, usesResponses),
			callbacks: [new N8nLlmTracing(this)],
			supportsStrictToolCalling: false,
			onFailedAttempt: makeN8nLlmFailedAttemptHandler(this, (error: unknown) => {
				const { status } = error as { status?: number };
				if (status !== undefined && !shouldRetry(status)) throw error;
				nameTransportFault(error);
			}),
			...(usesResponses
				? {}
				: {
						frequencyPenalty: options.frequencyPenalty,
						presencePenalty: options.presencePenalty,
						stop: options.stop ? options.stop.split(',').map((item) => item.trim()) : undefined,
					}),
		};

		if (usesResponses) return { response: new ChatOpenAI({ ...fields, useResponsesApi: true }) };

		return { response: wrapChatModelMessageInput(new ChatOpenAICompletions(fields)) };
	}
}