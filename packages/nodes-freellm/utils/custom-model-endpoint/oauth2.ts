export interface OAuth2Token {
	access_token: string;
	expires_at: number;
	token_type: string;
}

export async function getOAuth2Token(
	tokenUrl: string,
	clientId: string,
	clientSecret: string,
	scope: string,
	sendCredentialsIn: 'header' | 'body',
): Promise<OAuth2Token> {
	const params = new URLSearchParams({
		grant_type: 'client_credentials',
		client_id: clientId,
		client_secret: clientSecret,
	});

	if (scope) {
		params.append('scope', scope);
	}

	const headers: Record<string, string> = {
		'Content-Type': 'application/x-www-form-urlencoded',
	};

	if (sendCredentialsIn === 'header') {
		const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
		headers['Authorization'] = `Basic ${encoded}`;
		params.delete('client_id');
		params.delete('client_secret');
	}

	const response = await fetch(tokenUrl, {
		method: 'POST',
		headers,
		body: params.toString(),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`OAuth2 token request failed: ${response.status} ${error}`);
	}

	const data = await response.json() as OAuth2Token & { expires_in?: number };

	return {
		access_token: data.access_token,
		expires_at: Date.now() + (data.expires_in ?? 3600) * 1000,
		token_type: data.token_type ?? 'Bearer',
	};
}