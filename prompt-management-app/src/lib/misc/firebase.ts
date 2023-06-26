import { initializeApp } from 'firebase/app';
import { getDatabase, get, ref } from 'firebase/database';
import {
	PUBLIC_FIREBASE_API_KEY,
	PUBLIC_FIREBASE_AUTH_DOMAIN,
	PUBLIC_FIREBASE_PROJECT_ID,
	PUBLIC_FIREBASE_DATABASE_URL,
	PUBLIC_FIREBASE_STORAGE_BUCKET,
	PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	PUBLIC_FIREBASE_APP_ID
} from '$env/static/public';
import type { Chat, ChatMessage } from './shared';

/**
 * This can only be executed server-side!
 * The client has no access to $env/static/private.
 * That's exactly what we want, therefore we wrap the firebase calls in our own API/endpoints.
 */

const throwIfUnset = (name: string, value: any) => {
	if (value == null) throw new Error(`${name} environment variable missing`);
};

throwIfUnset(PUBLIC_FIREBASE_API_KEY, 'PUBLIC_FIREBASE_API_KEY');
throwIfUnset(PUBLIC_FIREBASE_AUTH_DOMAIN, 'PUBLIC_FIREBASE_AUTH_DOMAIN');
throwIfUnset(PUBLIC_FIREBASE_PROJECT_ID, 'PUBLIC_FIREBASE_PROJECT_ID');
throwIfUnset(PUBLIC_FIREBASE_DATABASE_URL, 'PUBLIC_FIREBASE_DATABASE_URL');
throwIfUnset(PUBLIC_FIREBASE_STORAGE_BUCKET, 'PUBLIC_FIREBASE_STORAGE_BUCKET');
throwIfUnset(PUBLIC_FIREBASE_MESSAGING_SENDER_ID, 'PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
throwIfUnset(PUBLIC_FIREBASE_APP_ID, 'PUBLIC_FIREBASE_APP_ID');

const firebaseConfig = {
	apiKey: PUBLIC_FIREBASE_API_KEY,
	authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: PUBLIC_FIREBASE_PROJECT_ID,
	firebaseUrl: PUBLIC_FIREBASE_DATABASE_URL,
	storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

export async function loadChatFromDb(slug: string) {
	const response = (await get(ref(db, `sharedchats/${slug}`))).toJSON() as Chat;

	// firebase stores array as objects like { 0: whatever, 1: whateverelse }
	const convertMessagesToArray = (messagesObj: Chat | ChatMessage[]): ChatMessage[] => {
		const messages: ChatMessage[] = [];
		for (const message of Object.values(messagesObj)) {
			const chatMessage = message as ChatMessage;
			if (chatMessage.messages) {
				chatMessage.messages = convertMessagesToArray(chatMessage.messages);
			}
			messages.push(chatMessage);
		}
		return messages;
	};

	if (response?.messages) {
		const messages = convertMessagesToArray(response.messages);

		return {
			...response,
			messages
		};
	}

	return response;
}
