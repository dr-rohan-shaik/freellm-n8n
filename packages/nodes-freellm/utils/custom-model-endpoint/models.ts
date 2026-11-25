import type { ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';

export async function searchModels(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
	const credentials = await this.getCredentials('freeLlmApi');
	const baseURL = credentials.url as string || 'http://localhost:3000/v1';

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
		// Fallback models - standard IDs used by FreeLLMAPI (tashfeenahmed/freellmapi)
		const freellmModels = [
			{ name: 'gpt-4o', value: 'gpt-4o', description: 'GPT-4o - Most capable OpenAI model' },
			{ name: 'gpt-4o-mini', value: 'gpt-4o-mini', description: 'GPT-4o Mini - Fast and cost-effective' },
			{ name: 'gpt-4-turbo', value: 'gpt-4-turbo', description: 'GPT-4 Turbo - High performance' },
			{ name: 'gpt-4', value: 'gpt-4', description: 'GPT-4 - Legacy but powerful' },
			{ name: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo', description: 'GPT-3.5 Turbo - Fast and cheap' },
			{ name: 'claude-3.5-sonnet', value: 'claude-3.5-sonnet', description: 'Claude 3.5 Sonnet - Excellent reasoning' },
			{ name: 'claude-3.5-haiku', value: 'claude-3.5-haiku', description: 'Claude 3.5 Haiku - Fast and smart' },
			{ name: 'claude-3-opus', value: 'claude-3-opus', description: 'Claude 3 Opus - Most capable Claude' },
			{ name: 'llama-3.1-405b', value: 'llama-3.1-405b', description: 'Llama 3.1 405B - Largest open model' },
			{ name: 'llama-3.1-70b', value: 'llama-3.1-70b', description: 'Llama 3.1 70B - Strong open model' },
			{ name: 'llama-3.1-8b', value: 'llama-3.1-8b', description: 'Llama 3.1 8B - Fast open model' },
			{ name: 'mistral-large', value: 'mistral-large', description: 'Mistral Large - Top tier' },
			{ name: 'mistral-nemo', value: 'mistral-nemo', description: 'Mistral Nemo - Efficient' },
			{ name: 'mixtral-8x7b', value: 'mixtral-8x7b', description: 'Mixtral 8x7B - MoE model' },
			{ name: 'gemini-1.5-pro', value: 'gemini-1.5-pro', description: 'Gemini 1.5 Pro - Google\'s best' },
			{ name: 'gemini-1.5-flash', value: 'gemini-1.5-flash', description: 'Gemini 1.5 Flash - Fast' },
			{ name: 'command-r-plus', value: 'command-r-plus', description: 'Command R+ - RAG optimized' },
			{ name: 'command-r', value: 'command-r', description: 'Command R - Efficient RAG' },
		];

		const results = freellmModels
			.filter((m) => !filter || m.name.toLowerCase().includes(filter.toLowerCase()))
			.map((m) => ({ name: m.name, value: m.value, description: m.description }));

		return { results };
	}
}