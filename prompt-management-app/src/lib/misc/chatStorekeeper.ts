import type { Chat, ChatMessage } from './shared';

/**
 * This class is just used to move some lengthy logic out of the stores file.
 * Contains only static functions and does not temper with the Svelte store.
 */
export class ChatStorekeeper {
	static isFlat(chat: Chat): boolean {
		return (function checkMessages(messages?: ChatMessage[]): boolean {
			if (!messages || messages.length === 0) {
				return true;
			}

			for (const message of messages) {
				if (message.childMessages && message.childMessages.length > 1) {
					return false;
				}

				if (message.childMessages && message.childMessages.length === 1) {
					return checkMessages(message.childMessages);
				}
			}

			return true;
		})(chat.messages);
	}

	static getById(messageId: string, chatMessages: ChatMessage[]): ChatMessage | null {
		for (const message of chatMessages) {
			if (message.id === messageId) {
				return message;
			}

			if (message.childMessages) {
				const foundMessage = ChatStorekeeper.getById(messageId, message.childMessages);
				if (foundMessage) {
					return foundMessage;
				}
			}
		}
		return null;
	}

	static findParent(
		messageId: string,
		chatMessages: ChatMessage[]
	): { parent: ChatMessage; index: number } | null {
		for (let i = 0; i < chatMessages.length; i++) {
			const parent = chatMessages[i];
			if (parent.childMessages) {
				const index = parent.childMessages.findIndex((msg) => msg.id === messageId);
				if (index !== -1) {
					return {
						parent,
						index
					};
				}

				const foundParent = ChatStorekeeper.findParent(messageId, parent.childMessages);
				if (foundParent) {
					return foundParent;
				}
			}
		}

		return null;
	}

	static addMessageAsChild(
		chatMessages: ChatMessage[],
		parentId: string,
		messageToAdd: ChatMessage
	): ChatMessage[] {
		return chatMessages.map((message) => {
			if (message.id === parentId) {
				return {
					...message,
					messages: message.childMessages ? [...message.childMessages, messageToAdd] : [messageToAdd]
				};
			}

			if (message.childMessages) {
				message.childMessages = ChatStorekeeper.addMessageAsChild(
					message.childMessages,
					parentId,
					messageToAdd
				);
			}

			return message;
		});
	}

	static getCurrentMessageBranch(chat: Chat, includeContext = true): ChatMessage[] {
		const result: ChatMessage[] = includeContext && chat.contextMessage.content
			? [{ message: chat.contextMessage }]
			: [];

		function traverse(messages: ChatMessage[]): void {
			if (messages.length === 1) {
				result.push(messages[0]);
				if (messages[0].childMessages) {
					traverse(messages[0].childMessages);
				}
			} else {
				for (const message of messages) {
					if (message.isSelected) {
						result.push(message);
						if (message.childMessages) {
							traverse(message.childMessages);
						}
						break;
					}
				}
			}
		}

		traverse(chat.messages);
		return result;
	}

	static selectSibling(id: string, messages: ChatMessage[]): boolean {
		let found = false;
		for (const message of messages) {
			if (found) break;

			if (message.id === id) {
				message.isSelected = true;
				found = true;

				for (const sibling of messages) {
					if (sibling.id !== id) {
						sibling.isSelected = false;
					}
				}
			} else if (message.childMessages) {
				found = ChatStorekeeper.selectSibling(id, message.childMessages);
			}
		}
		return found;
	}

	static countAllMessages(chat: Chat): number {
		function countMessages(messages: ChatMessage[]): number {
			if (!messages || messages.length === 0) {
				return 0;
			}

			let count = 0;
			for (const message of messages) {
				count += 1;
				if (message.childMessages) {
					count += countMessages(message.childMessages);
				}
			}
			return count;
		}

		return countMessages(chat.messages);
	}

	static countMessagesInCurrentBranch(chat: Chat): number {
		return ChatStorekeeper.getCurrentMessageBranch(chat, false).length;
	}
}
