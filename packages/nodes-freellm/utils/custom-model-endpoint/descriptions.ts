import type { INodeProperties } from 'n8n-workflow';

export const CHAT_COMPLETIONS_FORMAT = 'chat_completions';
export const RESPONSES_FORMAT = 'responses';

export const SEARCH_ALIASES = [
	'freellm',
	'free llm',
	'gpt-4o',
	'gpt-4',
	'claude',
	'llama',
	'mistral',
	'chat model',
	'llm',
];

export const modelField: INodeProperties = {
	displayName: 'Model',
	name: 'model',
	type: 'options',
	typeOptions: {
		loadOptionsMethod: 'searchModels',
		loadOptionsDependsOn: ['authentication'],
	},
	default: '',
	description: 'Choose the model to use. FreeLLM provides access to GPT-4o, GPT-4, Claude 3.5 Sonnet, Llama 3.1, Mistral Large, and more.',
	placeholder: 'e.g. freellm-gpt-4o, freellm-claude-3.5-sonnet, freellm-llama-3.1-405b',
};

export const apiFormatField: INodeProperties = {
	displayName: 'API Format',
	name: 'apiFormat',
	type: 'options',
	options: [
		{
			name: 'Chat Completions (Standard)',
			value: CHAT_COMPLETIONS_FORMAT,
			description: 'Standard OpenAI-compatible chat completions format',
		},
		{
			name: 'Responses API (New)',
			value: RESPONSES_FORMAT,
			description: 'New OpenAI Responses API format with built-in tools',
		},
	],
	default: CHAT_COMPLETIONS_FORMAT,
	description: 'The API format to use. Most gateways support Chat Completions. Responses API is newer and supports built-in tools.',
};

export const responsesFormatNotice: INodeProperties = {
	displayName: '⚠️ Responses API Notice',
	name: 'responsesFormatNotice',
	type: 'notice',
	default: '',
	displayOptions: {
		show: {
			apiFormat: [RESPONSES_FORMAT],
		},
	},
	description: 'The Responses API is a newer format. Ensure your FreeLLM endpoint supports it. Some features like function calling may work differently.',
};

export const requestHeaderFields: INodeProperties[] = [
	{
		displayName: 'Additional Headers',
		name: 'headers',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Header',
		default: {},
		description: 'Custom headers to send with each request. Useful for routing, tracking, or custom authentication.',
		options: [
			{
				displayName: 'Header',
				name: 'header',
				values: [
					{ displayName: 'Name', name: 'name', type: 'string', default: '' },
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						typeOptions: { password: true },
						default: '',
					},
				],
			},
		],
	},
	{
		displayName: 'Send Context Headers',
		name: 'sendContextHeaders',
		type: 'boolean',
		default: true,
		description: 'Whether to send n8n context headers (workflow ID, execution ID, etc.) for debugging and tracing.',
	},
];

export const chatModelOptions: INodeProperties = {
	displayName: 'Options',
	name: 'options',
	type: 'collection',
	placeholder: 'Add Option',
	default: {},
	options: [
		{
			displayName: 'Temperature',
			name: 'temperature',
			type: 'number',
			default: 0.7,
			description: 'Controls randomness. Lower = more deterministic, higher = more creative.',
			typeOptions: { minValue: 0, maxValue: 2, step: 0.1 },
		},
		{
			displayName: 'Top P',
			name: 'topP',
			type: 'number',
			default: 1,
			description: 'Nucleus sampling. Alternative to temperature.',
			typeOptions: { minValue: 0, maxValue: 1, step: 0.01 },
		},
		{
			displayName: 'Max Tokens',
			name: 'maxTokens',
			type: 'number',
			default: -1,
			description: 'Maximum tokens to generate. -1 = model default.',
			typeOptions: { minValue: -1 },
		},
		{
			displayName: 'Max Output Tokens',
			name: 'maxOutputTokens',
			type: 'number',
			default: -1,
			description: 'Maximum output tokens (Responses API only). -1 = model default.',
			typeOptions: { minValue: -1 },
		},
		{
			displayName: 'Frequency Penalty',
			name: 'frequencyPenalty',
			type: 'number',
			default: 0,
			description: 'Penalizes repeated tokens.',
			typeOptions: { minValue: -2, maxValue: 2, step: 0.1 },
		},
		{
			displayName: 'Presence Penalty',
			name: 'presencePenalty',
			type: 'number',
			default: 0,
			description: 'Encourages new topics.',
			typeOptions: { minValue: -2, maxValue: 2, step: 0.1 },
		},
		{
			displayName: 'Seed',
			name: 'seed',
			type: 'number',
			default: -1,
			description: 'Seed for deterministic outputs. -1 = random.',
			typeOptions: { minValue: -1 },
		},
		{
			displayName: 'Stop Sequences',
			name: 'stop',
			type: 'string',
			default: '',
			description: 'Comma-separated stop sequences.',
			placeholder: 'STOP, END',
		},
		{
			displayName: 'Timeout (ms)',
			name: 'timeout',
			type: 'number',
			default: 60000,
			description: 'Request timeout in milliseconds.',
			typeOptions: { minValue: 1000 },
		},
		{
			displayName: 'Max Retries',
			name: 'maxRetries',
			type: 'number',
			default: 2,
			description: 'Maximum retry attempts for failed requests.',
			typeOptions: { minValue: 0, maxValue: 10 },
		},
		{
			displayName: 'Reasoning Summary',
			name: 'reasoningSummary',
			type: 'options',
			options: [
				{ name: 'Auto', value: 'auto' },
				{ name: 'Concise', value: 'concise' },
				{ name: 'Detailed', value: 'detailed' },
			],
			default: 'auto',
			description: 'Include reasoning summary in response (Responses API only).',
			displayOptions: {
				show: {
					apiFormat: [RESPONSES_FORMAT],
				},
			},
		},
		{
			displayName: 'Store Response',
			name: 'storeResponse',
			type: 'boolean',
			default: false,
			description: 'Store response for OpenAI dashboard (Responses API only).',
			displayOptions: {
				show: {
					apiFormat: [RESPONSES_FORMAT],
				},
			},
		},
		{
			displayName: 'Truncation',
			name: 'truncation',
			type: 'options',
			options: [
				{ name: 'Auto', value: 'auto' },
				{ name: 'Disabled', value: 'disabled' },
			],
			default: 'auto',
			description: 'Truncation strategy for long conversations (Responses API only).',
			displayOptions: {
				show: {
					apiFormat: [RESPONSES_FORMAT],
				},
			},
		},
		{
			displayName: 'Extra Body (JSON)',
			name: 'extraBody',
			type: 'string',
			default: '',
			description: 'Additional JSON to merge into the request body. Use for provider-specific parameters.',
			placeholder: '{"provider_specific_param": "value"}',
			typeOptions: {
				rows: 4,
			},
		},
	],
};