import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { ChatOpenAI, ChatOpenAICompletions, type ChatOpenAIFields } from '@langchain/openai';
import { Configuration } from '@langchain/openai';
import { pull } from 'langchain/hub';
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
} from '@utils/custom-model-endpoint/gateway-config';
import { toHeaderRecord } from '@utils/custom-model-endpoint/headers';

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
	systemPrompt?: string;
	maxIterations?: number;
	returnIntermediateSteps?: boolean;
}

const RETRYABLE = new Set([408, 429]);

function shouldRetry(status: number): boolean {
	return RETRYABLE.has(status) || status >= 500;
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
	const kwargs: Record<string, unknown> = usesResponses ? {} : {};
	if (!usesResponses && options.seed !== undefined) kwargs.seed = options.seed;

	const hasExtraBody = typeof extraBody === 'string' ? extraBody.trim() !== '' : Boolean(extraBody);
	if (hasExtraBody) Object.assign(kwargs, parseExtraBody(ctx, extraBody, itemIndex));

	return Object.keys(kwargs).length > 0 ? kwargs : undefined;
}

function limitOrUnset(value: number | undefined): number | undefined {
	return value !== undefined && value > 0 ? value : undefined;
}

export class FreeLlmAgent implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FreeLLM Agent',
		name: 'freeLlmAgent',
		icon: {
			light: 'file:../../../icons/freellm.svg',
			dark: 'file:../../../icons/freellm.dark.svg',
		},
		group: ['transform'],
		version: [1],
		description: 'AI Agent powered by FreeLLM - use any model with tools',
		defaults: {
			name: 'FreeLLM Agent',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Agents', 'Root Nodes'],
				Agents: ['FreeLLM Agent'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://docs.freellm.com/integrations/n8n/agents',
					},
				],
			},
		},

		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: FREELLM_CREDENTIAL,
				required: true,
			},
		],
		properties: [
			getConnectionHintNoticeField([NodeConnectionTypes.AiTool]),
			{
				displayName: 'System Prompt',
				name: 'systemPrompt',
				type: 'string',
				typeOptions: { rows: 4 },
				default: 'You are a helpful AI assistant with access to various tools. Use them to complete tasks efficiently.',
				description: 'System prompt for the agent',
			},
			modelField,
			apiFormatField,
			responsesFormatNotice,
			...requestHeaderFields,
			chatModelOptions,
			{
				displayName: 'Agent Options',
				name: 'agentOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Max Iterations',
						name: 'maxIterations',
						type: 'number',
						default: 10,
						description: 'Maximum number of iterations for the agent',
						typeOptions: { minValue: 1, maxValue: 50 },
					},
					{
						displayName: 'Return Intermediate Steps',
						name: 'returnIntermediateSteps',
						type: 'boolean',
						default: false,
						description: 'Whether to return intermediate steps in the output',
					},
					{
						displayName: 'Early Stopping Method',
						name: 'earlyStoppingMethod',
						type: 'options',
						options: [
							{ name: 'Generate', value: 'generate' },
							{ name: 'Force', value: 'force' },
						],
						default: 'generate',
						description: 'How to handle early stopping',
					},
				],
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const credential = await this.getCredentials(FREELLM_CREDENTIAL);

		const model = this.getNodeParameter('model', itemIndex, '', {
			extractValue: true,
		}) as string;

		const options = this.getNodeParameter('options', itemIndex, {}) as Options;
		const agentOptions = this.getNodeParameter('agentOptions', itemIndex, {}) as Options;
		const usesResponses =
			this.getNodeParameter('apiFormat', itemIndex, CHAT_COMPLETIONS_FORMAT) === RESPONSES_FORMAT;
		const sendContextHeaders = this.getNodeParameter(
			'sendContextHeaders',
			itemIndex,
			true,
		) as boolean;
		const headerRows = this.getNodeParameter('headers.header', itemIndex, []) as IDataObject[];
		const extraBody: unknown = this.getNodeParameter('extraBody', itemIndex, '');
		const systemPrompt = this.getNodeParameter('systemPrompt', itemIndex, '') as string;

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

		let llm;
		if (usesResponses) {
			llm = new ChatOpenAI({ ...fields, useResponsesApi: true });
		} else {
			llm = wrapChatModelMessageInput(new ChatOpenAICompletions(fields));
		}

		const prompt = await pull('hwchase17/openai-tools-agent');

		const tools = this.getTools ? await this.getTools() : [];

		const agent = createOpenAIToolsAgent({
			llm,
			tools,
			prompt,
		});

		const executor = new AgentExecutor({
			agent,
			tools,
			maxIterations: agentOptions.maxIterations ?? 10,
			returnIntermediateSteps: agentOptions.returnIntermediateSteps ?? false,
			earlyStoppingMethod: agentOptions.earlyStoppingMethod as 'generate' | 'force' ?? 'generate',
		});

		return {
			response: {
				async invoke(input: any) {
					const result = await executor.invoke({ input, systemPrompt });
					return result.output;
				},
			},
		};
	}
}