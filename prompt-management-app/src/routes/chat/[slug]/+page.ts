import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { chatStore } from '$lib/misc/stores';
import { migrateChat } from '$lib/misc/chatMigration';

export const load: PageLoad = async ({ params }) => {
	const { slug } = params;

	const chat = get(chatStore)[slug];
	const { chat: migratedChat, migrated } = migrateChat(chat);

	if (migrated) {
		chatStore.updateChat(slug, migratedChat);
		console.log(`migrated chat: ${slug}`);
	}

	return {
		slug
	};
};
