import type {
	ICredentialDataDecryptedObject,
	ICredentialType,
	INode,
	ISupplyDataFunctions,
} from 'n8n-workflow';
import { Configuration } from '@langchain/openai';

export const FREELLM_CREDENTIAL = 'freeLlmApi';
export const OPENAI_CREDENTIAL = 'openAiApi';
export const CUSTOM_MODEL_ENDPOINT_CREDENTIAL = 'customModelEndpointApi';

export interface CustomModelEndpointConfig {
	configuration: Configuration;
	model: string;
}

export interface CreateCustomModelEndpointConfigOptions {
	credentialType: string;
	timeout?: number;
	contextHeaders?: Record<string, string>;
	userHeaders?: Record<string, string>;
}

export function pickCredentialType(node: INode): string {
	const auth = node.parameters?.authentication as string | undefined;
	if (auth === OPENAI_CREDENTIAL) return OPENAI_CREDENTIAL;
	if (auth === FREELLM_CREDENTIAL) return FREELLM_CREDENTIAL;
	return CUSTOM_MODEL_ENDPOINT_CREDENTIAL;
}

export function readCustomModelEndpointCredential(
	credentials: ICredentialDataDecryptedObject,
): {
	url: string;
	login: {
		type: 'bearer' | 'header' | 'basic' | 'oauth2' | 'none';
		apiKey?: string;
		authHeaderName?: string;
		authHeaderPrefix?: string;
		username?: string;
		password?: string;
		tokenUrl?: string;
		clientId?: string;
		clientSecret?: string;
		scope?: string;
		sendCredentialsIn?: 'header' | 'body';
	};
	gatewayHeaders: Array<{ name: string; value: string }>;
} {
	return {
		url: (credentials.url as string) || '',
		login: {
			type: (credentials.authentication as 'bearer' | 'header' | 'basic' | 'oauth2' | 'none') || 'bearer',
			apiKey: credentials.apiKey as string,
			authHeaderName: credentials.authHeaderName as string,
			authHeaderPrefix: credentials.authHeaderPrefix as string,
			username: credentials.username as string,
			password: credentials.password as string,
			tokenUrl: credentials.tokenUrl as string,
			clientId: credentials.clientId as string,
			clientSecret: credentials.clientSecret as string,
			scope: credentials.scope as string,
			sendCredentialsIn: credentials.sendCredentialsIn as 'header' | 'body',
		},
		gatewayHeaders: (credentials.gatewayHeaders?.headers as Array<{ name: string; value: string }>) || [],
	};
}

export function createCustomModelEndpointConfig(
	ctx: ISupplyDataFunctions,
	credentials: ICredentialDataDecryptedObject,
	options: CreateCustomModelEndpointConfigOptions,
): { configuration: Configuration; model: string } {
	const endpoint = readCustomModelEndpointCredential(credentials);

	const baseURL = endpoint.url.endsWith('/') ? endpoint.url.slice(0, -1) : endpoint.url;

	const configuration = new Configuration({
		baseURL,
		baseOptions: {
			timeout: options.timeout ?? 60000,
			headers: {
				...options.contextHeaders,
				...options.userHeaders,
				...Object.fromEntries(endpoint.gatewayHeaders.map((h) => [h.name, h.value])),
			},
		},
	});

	return {
		configuration,
		model: '',
	};
}

export function buildRequestHeaders({
	endpoint,
	requestHeaders,
}: {
	endpoint: ReturnType<typeof readCustomModelEndpointCredential>;
	requestHeaders: Record<string, string>;
}): Record<string, string> {
	const headers = { ...requestHeaders };

	switch (endpoint.login.type) {
		case 'bearer':
			if (endpoint.login.apiKey) {
				headers['Authorization'] = `Bearer ${endpoint.login.apiKey}`;
			}
			break;
		case 'header':
			if (endpoint.login.apiKey && endpoint.login.authHeaderName) {
				const prefix = endpoint.login.authHeaderPrefix ? `${endpoint.login.authHeaderPrefix} ` : '';
				headers[endpoint.login.authHeaderName] = `${prefix}${endpoint.login.apiKey}`;
			}
			break;
		case 'basic':
			if (endpoint.login.username && endpoint.login.password) {
				const encoded = Buffer.from(`${endpoint.login.username}:${endpoint.login.password}`).toString('base64');
				headers['Authorization'] = `Basic ${encoded}`;
			}
			break;
		case 'none':
			break;
	}

	for (const h of endpoint.gatewayHeaders) {
		if (h.name && h.value) {
			headers[h.name] = h.value;
		}
	}

	return headers;
}

export function toHeaderRecord(headers: Record<string, unknown>): Record<string, string> {
	const result: Record<string, string> = {};
	for (const [key, value] of Object.entries(headers)) {
		if (value !== undefined && value !== null && value !== '') {
			result[key] = String(value);
		}
	}
	return result;
}