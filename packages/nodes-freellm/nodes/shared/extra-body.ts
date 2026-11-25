import type { ISupplyDataFunctions } from 'n8n-workflow';

export function parseExtraBody(
	ctx: ISupplyDataFunctions,
	extraBody: unknown,
	itemIndex: number,
): Record<string, unknown> {
	if (typeof extraBody !== 'string') return {};

	const trimmed = extraBody.trim();
	if (!trimmed) return {};

	try {
		const parsed = JSON.parse(trimmed);
		if (typeof parsed === 'object' && parsed !== null) {
			return parsed as Record<string, unknown>;
		}
	} catch {
		ctx.logger?.warn?.('Failed to parse extraBody as JSON, ignoring', { extraBody });
	}

	return {};
}