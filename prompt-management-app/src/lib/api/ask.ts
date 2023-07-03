import type {CreateChatCompletionRequest, CreateChatCompletionResponse} from "openai";

export default function ask(message: CreateChatCompletionRequest): Promise<CreateChatCompletionResponse> {
    return fetch('/api/ask', {
        method: 'POST',
        body: JSON.stringify(message)
    }).then((response) => response.json());
}
