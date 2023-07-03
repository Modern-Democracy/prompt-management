import type {ChatCompletionRequestMessage, ChatCompletionResponseMessage} from "openai";

export default function ask(message: ChatCompletionRequestMessage): Promise<ChatCompletionResponseMessage> {
    return fetch('/api/ask', {
        method: 'POST',
        body: JSON.stringify(message)
    }).then((response) => response.json());
}
