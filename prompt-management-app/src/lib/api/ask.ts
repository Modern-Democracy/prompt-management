import type {CreateChatCompletionRequest, CreateChatCompletionResponse} from "openai";
import {Observable} from "rxjs";
import Chat from "$lib/Chat.svelte";
import type {ChatStore} from "$lib/misc/stores";

function fetchAsStream(url: string, payload: any): Observable<Uint8Array> {
    return new Observable((subscriber) => {
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
            .then((response) => {
                const reader = response.body!.getReader();
                return new ReadableStream({
                    start(controller) {
                        function push() {
                            reader.read().then(({done, value}) => {
                                if (done) {
                                    controller.close();
                                    subscriber.complete();
                                    return;
                                }
                                subscriber.next(value!);
                                controller.enqueue(value);
                                push();
                            });
                        };
                        push();
                    }
                });
            })
            .catch((error) => {
                subscriber.error(error);
            });
    });
}

export function ask(slug: string, chat: Chat, payload: CreateChatCompletionRequest, chatStore: ChatStore) {
    if (payload.stream) {
        const obs = fetchAsStream('/api/ask', payload);

        obs.subscribe({
            next(chunk) {
                const eventList = new TextDecoder('utf-8').decode(chunk);
                /**
                 * Split the event list into individual events. Data in eventList is formatted as follows:
                 *
                 * data: {"id":"chatcmpl-7YyPNAvVcRGH5cxFOdX4fdayqlnNI","object":"chat.completion.chunk","created":1688569717,"model":"gpt-3.5-turbo-0613","choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}
                 *
                 * data: {"id":"chatcmpl-7YyPNAvVcRGH5cxFOdX4fdayqlnNI","object":"chat.completion.chunk","created":1688569717,"model":"gpt-3.5-turbo-0613","choices":[{"index":0,"delta":{"content":"The"},"finish_reason":null}]}
                 *
                 * data: {"id":"chatcmpl-7YyPNAvVcRGH5cxFOdX4fdayqlnNI","object":"chat.completion.chunk","created":1688569717,"model":"gpt-3.5-turbo-0613","choices":[{"index":1,"delta":{"role":"assistant","content":""},"finish_reason":null}]}
                 *
                 * data: {"id":"chatcmpl-7YyPNAvVcRGH5cxFOdX4fdayqlnNI","object":"chat.completion.chunk","created":1688569717,"model":"gpt-3.5-turbo-0613","choices":[{"index":1,"delta":{"content":"The"},"finish_reason":null}]}
                 */
                // TODO: exclude empty lines
                const responses = eventList.split(/data: (.+)$/gm);
                if (responses) {
                    for (const response of responses.values()) {
                        if (response.startsWith('{')) {
                            const packet: CreateChatCompletionResponse = JSON.parse(response);
                            if (packet.object !== 'chat.completion.chunk') {
                                if (packet.choices[0].message?.content?.startsWith('Additional properties are not allowed (')) {
                                    throw new Error(`Unexpected properties found on request object. Error returned: ${packet.choices[0].message.content}`);
                                } else {
                                    throw new Error(`Unexpected object type: ${packet.object}`);
                                }
                                    /**
                                     * [
                                     *     "{\"message\":\"Additional properties are not allowed ('id', 'isSelected' were unexpected) - 'messages.0'\"}"
                                     * ]
                                     */
                            }
                            // @ts-ignore
                            const targetMessage = chat.messages.find((message) => message.id === packet.id && (message.index === undefined || message.index === packet.choices[0].index));
                            if (!targetMessage) {
                                const newMessage = {
                                    id: packet.id,
                                    content: packet.choices[0].delta.content,
                                    role: packet.choices[0].delta.role,
                                    messages: [],
                                };
                                if (packet.choices[0].index !== undefined) {
                                    newMessage.index = packet.choices[0].index;
                                }
                                chat.messages.push(newMessage);
                                chatStore.addMessageToChat(slug, newMessage);
                            } else if (packet.choices[0].finish_reason === 'stop') {
                                console.debug('Finish reason is stop, skipping');
                            } else {
                                targetMessage.content = `${targetMessage.content}${packet.choices[0].delta.content}`;
                                chatStore.updateChat(slug, chat);
                            }
                        } else {
                            console.debug('Skipping empty line');
                        }
                    }
                } else {
                    console.log('No data packets found in response');
                }
                // Do something with the incoming chunk.
                // JSON.parse(`{${data}}`);
            },
            error(err) {
                console.error(err);
            },
            complete() {
                console.log(`Done loading data: ${JSON.stringify(chat)}`);
            },
        });
    } else {
        throw new Error('Stream should be true');
    }
}

export function askAndBlock(payload: CreateChatCompletionRequest): Promise<CreateChatCompletionResponse> {
    if (payload.stream) {
        throw new Error('Stream should be false');
    } else {
        return fetch('/api/ask', {
            method: 'POST',
            body: JSON.stringify(payload)
        }).then((response) => response.json());
    }
}
