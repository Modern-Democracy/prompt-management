import type {CreateCompletionRequest} from "openai";
import type {AxiosRequestConfig} from "axios";

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function createCompletion(completionRequest: CreateCompletionRequest, options?: AxiosRequestConfig) {
    return await openai.createCompletion(completionRequest, options);
}

/*
import axios from 'axios';

const openaiAPI = axios.create({
    baseURL: 'https://api.openai.com/v1/chat/completions',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    }
});

export async function generateText(prompt) {
    try {
        const response = await openaiAPI.post('', {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "user",
                    "content": "Who won the world series in 2020?"
                },
                {
                    "role": "assistant",
                    "content": "The Los Angeles Dodgers won the World Series in 2020."
                },
                {
                    "role": "user",
                    "content": "Where was it played?"
                }
            ],
            "temperature": 1,
            "top_p": 1,
            "n": 1,
            "stream": false,
            "max_tokens": 250,
            "presence_penalty": 0,
            "frequency_penalty": 0
        });
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error(error);
    }
}
*/
