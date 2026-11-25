import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { BaseMessage } from '@langchain/core/messages';

export function wrapChatModelMessageInput(model: BaseChatModel): BaseChatModel {
	const originalCall = model.call.bind(model);
	const originalInvoke = model.invoke.bind(model);
	const originalBatch = model.batch.bind(model);

	model.call = async (messages: BaseMessage[], options?: any) => {
		const processedMessages = messages.map((msg) => {
			if (msg.content && typeof msg.content === 'string') {
				return msg;
			}
			return msg;
		});
		return originalCall(processedMessages, options);
	};

	model.invoke = async (input: BaseMessage[] | string, options?: any) => {
		const messages = Array.isArray(input) ? input : [input];
		const processedMessages = messages.map((msg) => {
			if (typeof msg === 'string') return msg;
			if (msg.content && typeof msg.content === 'string') {
				return msg;
			}
			return msg;
		});
		return originalInvoke(processedMessages, options);
	};

	model.batch = async (inputs: (BaseMessage[] | string)[], options?: any) => {
		const processedInputs = inputs.map((input) => {
			const messages = Array.isArray(input) ? input : [input];
			return messages.map((msg) => {
				if (typeof msg === 'string') return msg;
				if (msg.content && typeof msg.content === 'string') {
					return msg;
				}
				return msg;
			});
		});
		return originalBatch(processedInputs, options);
	};

	return model;
}