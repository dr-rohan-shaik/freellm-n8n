export function toHeaderRecord(headers: Record<string, unknown>): Record<string, string> {
	const result: Record<string, string> = {};
	for (const [key, value] of Object.entries(headers)) {
		if (value !== undefined && value !== null && value !== '') {
			result[key] = String(value);
		}
	}
	return result;
}

export function buildRequestHeaders({
	endpoint,
	requestHeaders,
}: {
	endpoint: {
		login: {
			type: 'bearer' | 'header' | 'basic' | 'oauth2' | 'none';
			apiKey?: string;
			authHeaderName?: string;
			authHeaderPrefix?: string;
			username?: string;
			password?: string;
		};
		gatewayHeaders: Array<{ name: string; value: string }>;
	};
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