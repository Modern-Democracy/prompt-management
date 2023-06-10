<script>
    import { onMount, createEventDispatcher } from 'svelte';
    import { createCompletion } from './openai';
    import axios from 'axios';

    let chatHistory = [];
    let input = '';
    let completionRequest, axiosConfig;

    const dispatch = createEventDispatcher();

    async function sendPrompt(completionRequest, axiosConfig) {
        chatHistory.push({ type: 'prompt', content: input });
        dispatch('requestSent', { prompt: input });
        input = '';
        try {
            const response = await createCompletion(completionRequest, axiosConfig);
            chatHistory.push({ type: 'response', content: response.data.choices[0].text });
            dispatch('responseReceived', { response: response.data.choices[0].text });
        } catch (error) {
            console.error(error);
        }
    }
</script>

<style>
    .history { /* Styles for the chat history */ }
    .history .prompt { color: #b0bec5; } /* Light blue-grey for prompts */
    .history .response { color: #607d8b; } /* Darker blue-grey for responses */
    .input-field { /* Styles for the input field */ }
    .submit-button { /* Styles for the submit button */ }
</style>

<div class="history">
    {#each chatHistory as chat (chat.content)}
        <p class={chat.type}>{chat.content}</p>
    {/each}
</div>
<textarea bind:value={input} class="input-field"></textarea>
<button on:click={() => sendPrompt(completionRequest, axiosConfig)} class="submit-button">
    <!-- Insert send icon here -->
</button>
