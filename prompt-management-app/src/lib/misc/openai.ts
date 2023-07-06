import type { ChatCompletionRequestMessage } from 'openai';
import type { Chat, ChatCost } from './shared';
import GPT3Tokenizer from 'gpt3-tokenizer';
import { ChatStorekeeper } from './chatStorekeeper';

// Initialization is slow, so only do it once.
// TypeScript misinterprets the export default class GPT3Tokenizer from gpt3-tokenizer
// and throws "TypeError: GPT3Tokenizer is not a constructor" if we try to call the ctor here.
// Therefore, we initialize the tokenizer in the first call to countTokens().
let tokenizer: GPT3Tokenizer;

export enum OpenAiModel {
	Gpt35Turbo = 'gpt-3.5-turbo',
	Gpt35Turbo16k = 'gpt-3.5-turbo-16k',
	Gpt4 = 'gpt-4',
	Gpt432k = 'gpt-4-32k'
}

export interface OpenAiSettings {
	model: OpenAiModel;
	temperature: number; // 0-2
	top_p: number; // 0-1
	n: number; // any integer
	stream: boolean; // false-true
	max_tokens: number; // just for completions
	stop?: string | string[]; // max 4 entries in array
	presence_penalty: number; // -2-2
	frequency_penalty: number; // -2-2
}

export const defaultContextMessage = `Provide information in a direct, formal style without preambles, summaries, or using explanatory canned responses.

If you need clarification, ask before forming a response.

If my prompt lacks detail, list the details that are missing, organized by category and hierarchy.

Use existing models. Give clear options for me to choose.

Think carefully and logically, explaining your answer.
`;

export const defaultOpenAiSettings: OpenAiSettings = {
	model: OpenAiModel.Gpt35Turbo,
	temperature: 1,
	top_p: 1,
	n: 1,
	stream: true,
	max_tokens: 2048,
	presence_penalty: 0,
	frequency_penalty: 0
};

export interface OpenAiModelStats {
	maxTokens: number; // total length (prompts + completion)
	// $ per 1k tokens, see https://openai.com/pricing:
	costPrompt: number;
	costCompletion: number;
}

export const models: { [key in OpenAiModel]: OpenAiModelStats } = {
	'gpt-3.5-turbo': {
		maxTokens: 4096,
		costPrompt: 0.002,
		costCompletion: 0.002
	},
	'gpt-3.5-turbo-16k': {
		maxTokens: 16384,
		costPrompt: 0.03,
		costCompletion: 0.003
	},
	'gpt-4': {
		maxTokens: 8192,
		costPrompt: 0.03,
		costCompletion: 0.06
	},
	'gpt-4-32k': {
		maxTokens: 32768,
		costPrompt: 0.06,
		costCompletion: 0.12
	}
};
/**
 * see https://platform.openai.com/docs/guides/chat/introduction > Deep Dive Expander
 * see https://github.com/syonfox/GPT-3-Encoder/issues/2
 */
export function countTokens(message: ChatCompletionRequestMessage): number {
	// see comment above
	if (!tokenizer) {
		tokenizer = new GPT3Tokenizer({ type: 'gpt3' });
	}

	let num_tokens = 4; // every message follows <im_start>{role/name}\n{content}<im_end>\n
	for (const [key, value] of Object.entries(message)) {
		if (key !== 'name' && key !== 'role' && key !== 'content') {
			continue;
		}
		const encoded: { bpe: number[]; text: string[] } = tokenizer.encode(value);
		num_tokens += encoded.text.length;
		if (key === 'name') {
			num_tokens--; // if there's a name, the role is omitted
		}
	}

	return num_tokens;
}

export function estimateChatCost(chat: Chat): ChatCost {
	let tokensPrompt = 0;
	let tokensCompletion = 0;

	const messages = ChatStorekeeper.getCurrentMessageBranch(chat);

	for (const message of messages) {
		if (message.role === 'assistant') {
			tokensCompletion += countTokens(message);
		} else {
			// context counts as prompt (I think...)
			tokensPrompt += countTokens(message);
		}
	}

	// see https://platform.openai.com/docs/guides/chat/introduction > Deep Dive Expander
	const tokensTotal = tokensPrompt + tokensCompletion + 2; // every reply is primed with <im_start>assistant
	const {
		maxTokens,
		costPrompt: costPromptPer1k,
		costCompletion: costCompletionPer1k
	} = models[chat.settings.model];
	const costPrompt = (costPromptPer1k / 1000.0) * tokensPrompt;
	const costCompletion = (costCompletionPer1k / 1000.0) * tokensCompletion;

	return {
		tokensPrompt,
		tokensCompletion,
		tokensTotal: tokensTotal,
		costPrompt,
		costCompletion,
		costTotal: costPrompt + costCompletion,
		maxTokensForModel: maxTokens
	};
}
