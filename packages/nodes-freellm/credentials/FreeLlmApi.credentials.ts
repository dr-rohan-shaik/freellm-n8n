import type {
	ICredentialDataDecryptedObject,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class FreeLlmApi implements ICredentialType {
	name = 'freeLlmApi';

	displayName = 'FreeLLM API (Self-Hosted)';

	documentationUrl = 'https://github.com/tashfeenahmed/freellmapi';

	icon: Icon = {
		light: 'file:icons/freellm.svg',
		dark: 'file:icons/freellm.dark.svg',
	};

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'url',
			type: 'string',
			required: true,
			default: 'http://localhost:3000/v1',
			description: 'The base URL of your self-hosted FreeLLM API instance (e.g., http://localhost:3000/v1 or https://your-domain.com/v1). Must include /v1 suffix.',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'Your FreeLLM unified API key. Create one in the FreeLLM dashboard at /settings or /api/keys.',
		},
		{
			displayName: 'Default Model',
			name: 'defaultModel',
			type: 'string',
			default: 'gpt-4o',
			description: 'The default model to use when none is specified in the node. Model IDs come from your FreeLLM catalog (e.g., gpt-4o, claude-3.5-sonnet, llama-3.1-70b).',
		},
		{
			displayName: 'Add Custom Headers',
			name: 'customHeaders',
			type: 'fixedCollection',
			typeOptions: { multipleValues: true },
			placeholder: 'Add Header',
			default: {},
			description: 'Additional headers to send with every request (e.g., for routing or tracking).',
			options: [
				{
					displayName: 'Header',
					name: 'headers',
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
	];

	test = {
		request: {
			baseURL: '={{$credentials?.url}}',
			url: '/models',
			headers: {
				Authorization: '=Bearer {{$credentials?.apiKey}}',
			},
		},
	};

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		requestOptions.headers ??= {};

		requestOptions.headers['Authorization'] = `Bearer ${credentials.apiKey}`;

		if (credentials.customHeaders?.headers) {
			for (const header of credentials.customHeaders.headers) {
				if (header.name && header.value) {
					requestOptions.headers[header.name] = header.value;
				}
			}
		}

		return requestOptions;
	}
}