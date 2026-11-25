import type { ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';

export async function searchModels(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
	const credentials = await this.getCredentials('freeLlmApi');
	const baseURL = credentials.url as string || 'https://api.freellm.com/v1';

	try {
		const response = await this.helpers.httpRequest({
			method: 'GET',
			url: `${baseURL}/models`,
			headers: {
				Authorization: `Bearer ${credentials.apiKey}`,
			},
			json: true,
		});

		const models = response.data || [];
		const results = models
			.filter((model: { id: string }) => !filter || model.id.toLowerCase().includes(filter.toLowerCase()))
			.map((model: { id: string; owned_by?: string }) => ({
				name: model.id,
				value: model.id,
				description: `Provided by ${model.owned_by || 'FreeLLM'}`,
			}));

		return { results };
	} catch (error) {
		const freellmModels = [
			{ name: 'freellm-gpt-4o', value: 'freellm-gpt-4o', description: 'GPT-4o - Most capable model' },
			{ name: 'freellm-gpt-4o-mini', value: 'freellm-gpt-4o-mini', description: 'GPT-4o Mini - Fast and cost-effective' },
			{ name: 'freellm-gpt-4-turbo', value: 'freellm-gpt-4-turbo', description: 'GPT-4 Turbo - High performance' },
			{ name: 'freellm-gpt-4', value: 'freellm-gpt-4', description: 'GPT-4 - Legacy but powerful' },
			{ name: 'freellm-gpt-3.5-turbo', value: 'freellm-gpt-3.5-turbo', description: 'GPT-3.5 Turbo - Fast and cheap' },
			{ name: 'freellm-claude-3.5-sonnet', value: 'freellm-claude-3.5-sonnet', description: 'Claude 3.5 Sonnet - Excellent reasoning' },
			{ name: 'freellm-claude-3.5-haiku', value: 'freellm-claude-3.5-haiku', description: 'Claude 3.5 Haiku - Fast and smart' },
			{ name: 'freellm-claude-3-opus', value: 'freellm-claude-3-opus', description: 'Claude 3 Opus - Most capable Claude' },
			{ name: 'freellm-llama-3.1-405b', value: 'freellm-llama-3.1-405b', description: 'Llama 3.1 405B - Largest open model' },
			{ name: 'freellm-llama-3.1-70b', value: 'freellm-llama-3.1-70b', description: 'Llama 3.1 70B - Strong open model' },
			{ name: 'freellm-llama-3.1-8b', value: 'freellm-llama-3.1-8b', description: 'Llama 3.1 8B - Fast open model' },
			{ name: 'freellm-mistral-large', value: 'freellm-mistral-large', description: 'Mistral Large - Top tier' },
			{ name: 'freellm-mistral-nemo', value: 'freellm-mistral-nemo', description: 'Mistral Nemo - Efficient' },
			{ name: 'freellm-mixtral-8x7b', value: 'freellm-mixtral-8x7b', description: 'Mixtral 8x7B - MoE model' },
			{ name: 'freellm-gemini-1.5-pro', value: 'freellm-gemini-1.5-pro', description: 'Gemini 1.5 Pro - Google\'s best' },
			{ name: 'freellm-gemini-1.5-flash', value: 'freellm-gemini-1.5-flash', description: 'Gemini 1.5 Flash - Fast' },
			{ name: 'freellm-command-r-plus', value: 'freellm-command-r-plus', description: 'Command R+ - RAG optimized' },
			{ name: 'freellm-command-r', value: 'freellm-command-r', description: 'Command R - Efficient RAG' },
		];

		const results = freellmModels
			.filter((m) => !filter || m.name.toLowerCase().includes(filter.toLowerCase()))
			.map((m) => ({ name: m.name, value: m.value, description: m.description }));

		return { results };
	}
}