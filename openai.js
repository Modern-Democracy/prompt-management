import { OpenAIAPI } from 'openai';

const openai = new OpenAIAPI(process.env.OPENAI_API_KEY);

export default openai;

