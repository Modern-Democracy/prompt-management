import axios from 'axios';

const openaiAPI = axios.create({
    baseURL: 'https://api.openai.com/v1/engines/davinci-codex/completions',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    }
});

export async function generateText(prompt) {
    try {
        const response = await openaiAPI.post('', {
            prompt: prompt,
            max_tokens: 100
        });
        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error(error);
    }
}
