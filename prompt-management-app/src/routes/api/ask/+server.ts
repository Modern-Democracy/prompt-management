import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { getErrorMessage, throwIfUnset } from '$lib/misc/error';
import {PUBLIC_OPENAI_API_KEY} from "$env/static/public";


export const POST: RequestHandler = async ({ request, fetch }) => {
	try {
		const requestData = await request.json();
		throwIfUnset('request data', requestData);

		const openAiKey: string = PUBLIC_OPENAI_API_KEY;

		const apiUrl = 'https://api.openai.com/v1/chat/completions';

		if (requestData.stream) {
			const response = await fetch(apiUrl, {
				headers: {
					Authorization: `Bearer ${openAiKey}`,
					'Content-Type': 'application/json'
				},
				method: 'POST',
				body: JSON.stringify(requestData)
			});

			if (!response.ok) {
				const err = await response.json();
				throw err.error;
			}

			return new Response(response.body, {
				headers: {
					'Content-Type': 'text/event-stream'
				}
			});
		} else {
			const response = await fetch(apiUrl, {
				headers: {
					Authorization: `Bearer ${openAiKey}`,
					'Content-Type': 'application/json'
				},
				method: 'POST',
				body: JSON.stringify(requestData)
			});

			if (!response.ok) {
				const err = await response.json();
				throw err.error;
			}

			return new Response(response.body, {
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}
	} catch (err) {
		throw error(500, getErrorMessage(err));
	}
};
