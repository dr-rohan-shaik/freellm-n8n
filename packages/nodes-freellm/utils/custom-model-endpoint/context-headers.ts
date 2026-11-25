import type { ISupplyDataFunctions } from 'n8n-workflow';

export function n8nContextHeaders(ctx: ISupplyDataFunctions): Record<string, string> {
	const headers: Record<string, string> = {};

	const workflow = ctx.getWorkflow();
	if (workflow) {
		headers['X-n8n-Workflow-Id'] = workflow.id;
		headers['X-n8n-Workflow-Name'] = workflow.name;
	}

	const execution = ctx.getExecution();
	if (execution) {
		headers['X-n8n-Execution-Id'] = execution.id;
	}

	const node = ctx.getNode();
	if (node) {
		headers['X-n8n-Node-Name'] = node.name;
		headers['X-n8n-Node-Type'] = node.type;
	}

	return headers;
}