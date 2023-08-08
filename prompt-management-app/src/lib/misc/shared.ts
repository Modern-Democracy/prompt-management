import type { ChatCompletionRequestMessage } from 'openai';
import {ChatCompletionRequestMessageRoleEnum} from "openai/api";
import {
	modalStore,
	type ModalSettings,
	type ToastSettings,
	toastStore
} from '@skeletonlabs/skeleton';
import { get } from 'svelte/store';

import { goto } from '$app/navigation';
import { defaultOpenAiSettings, OpenAiModel, type OpenAiSettings } from '$lib/misc/openai';
import {generateSlug} from "$lib/misc/slug";
import { chatStore, settingsStore } from '$lib/misc/stores';

export interface ChatMessage {
	id?: string;
	index?: number;
	message: ChatCompletionRequestMessage;
	childMessages?: ChatMessage[];
	isSelected?: boolean;
	isAborted?: boolean;
}

export interface Chat {
	id?: string;
	title: string;
	settings: OpenAiSettings;
	contextMessage: ChatCompletionRequestMessage;
	messages: ChatMessage[];
	created: Date;

	isImported?: boolean;
	updateToken?: string;
}

export interface ClientSettings {
	openAiApiKey?: string;
	hideLanguageHint?: boolean;
	useTitleSuggestions?: boolean;
	defaultModel?: OpenAiModel;
}

export interface ChatCost {
	tokensPrompt: number;
	tokensCompletion: number;
	tokensTotal: number;
	costPrompt: number;
	costCompletion: number;
	costTotal: number;
	maxTokensForModel: number;
}

// Provide a function to generate a new chat instance based on the createNewChat example and Chat interface. Ensure it adheres to proper standards.
// Provide a function to determine if a chat has a title. Ensure it adheres to proper standards.
// Provide a function to suggest a chat title. Ensure it adheres to proper standards.
// Provide a function to show a modal component. Ensure it adheres to proper standards.
// Provide a function to show a toast. Ensure it adheres to proper standards.

export function createNewChat(template?: {
	context?: string;
	title?: string;
	settings?: OpenAiSettings;
	messages?: ChatMessage[];
}) {
	const settings = { ...(template?.settings || defaultOpenAiSettings) };
	const { defaultModel } = get(settingsStore);
	if (!settings.model && defaultModel) {
		settings.model = defaultModel;
	}

	const slug = generateSlug();
	const chat: Chat = {
		title: template?.title || slug,
		settings,
		contextMessage: {
			role: ChatCompletionRequestMessageRoleEnum.System,
			content: template?.context || ''
		},
		messages: template?.messages || [],
		created: new Date()
	};

	chatStore.updateChat(slug, chat);

	goto(`/chat/${slug}`, { invalidateAll: true });
}

export function canSuggestTitle(chat: Chat) {
	return chat.contextMessage?.content || chat.messages?.length > 0;
}

export async function suggestChatTitle(chat: Chat, openAiApiKey: string): Promise<string> {
	if (!canSuggestTitle(chat)) {
		return Promise.resolve(chat.title);
	}

	const messages =
		chat.messages.length === 1
			? chatStore.getCurrentMessageBranch(chat)
			: chat.contextMessage?.content
			? [{ message: chat.contextMessage }, ...chat.messages]
			: chat.messages;

	const filteredMessages = messages?.slice(0, chat.contextMessage?.content ? 3 : 2).map(
		(m) =>
			({
				role: m.message.role,
				content: m.message.content,
				name: m.message.name
			} as ChatCompletionRequestMessage)
	);

	const response = await fetch('/api/suggest-title', {
		method: 'POST',
		body: JSON.stringify({
			messages: filteredMessages,
			openAiKey: openAiApiKey
		})
	});
	const { title }: { title: string } = await response.json();

	return Promise.resolve(title);
}

export function showModalComponent(
	component: string,
	meta?: object,
	response?: ((r: any) => void) | undefined
) {
	const modal: ModalSettings = {
		type: 'component',
		component,
		meta,
		response
	};
	modalStore.trigger(modal);
}

export function showToast(
	message: string,
	type: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' = 'primary',
	autohide = true,
	timeout = 5000
) {
	const toast: ToastSettings = {
		background: `variant-filled-${type}`,
		message,
		autohide,
		timeout
	};
	toastStore.trigger(toast);
}
