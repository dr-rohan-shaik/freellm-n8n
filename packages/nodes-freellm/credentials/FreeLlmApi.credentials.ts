import type {
	ICredentialDataDecryptedObject,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class FreeLlmApi implements ICredentialType {
	name = 'freeLlmApi';

	displayName = 'FreeLLM';

	documentationUrl = 'https://freellm.com/docs';

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
			default: 'https://api.freellm.com/v1',
			description: 'The root URL of the FreeLLM API. n8n adds paths like /chat/completions automatically.',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'Your FreeLLM API key. Get one at https://freellm.com/api-keys',
		},
		{
			displayName: 'Default Model',
			name: 'defaultModel',
			type: 'string',
			default: 'freellm-gpt-4o',
			description: 'The default model to use when none is specified in the node.',
		},
		{
			displayName: 'Organization ID (optional)',
			name: 'organizationId',
			type: 'string',
			default: '',
			description: 'Only required if you belong to multiple organizations.',
		},
		{
			displayName: 'Add Custom Headers',
			name: 'customHeaders',
			type: 'fixedCollection',
			typeOptions: { multipleValues: true },
			placeholder: 'Add Header',
			default: {},
			description: 'Additional headers to send with every request.',
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

		if (credentials.organizationId) {
			requestOptions.headers['FreeLLM-Organization'] = credentials.organizationId as string;
		}

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