import OpenAI from 'openai';

import { TargetLanguage, LLM } from "./llm";
import { LLMStore, UserSettings } from './store';

const TIME_OUT_MS = 60000;

export class ChatGPT implements LLM {

    public async translate(text: string, onMessage: (message: string) => void) {
        const settings = await LLMStore.getUserSettings();
        if(settings.apiKey.trim() === '') {
            onMessage(chrome.i18n.getMessage('chatGPTApiKeyRequired'));
            return;
        }
        const prompt = this.getTranslationPrompt(settings.targetTransLang);
        await this.doRequest(settings, text, prompt, onMessage);
    }

    public async summary(text: string, onMessage: (message: string) => void) {
        const settings = await LLMStore.getUserSettings();
        if(settings.apiKey.trim() === '') {
            onMessage(chrome.i18n.getMessage('chatGPTApiKeyRequired'));
            return;
        }
        const prompt = this.getSummaryPrompt(settings.targetTransLang);
        await this.doRequest(settings, text, prompt, onMessage);
    }

    public async ieltsReading(text: string, onMessage: (message: string) => void) {
        const settings = await LLMStore.getUserSettings();
        if(settings.apiKey.trim() === '') {
            onMessage(chrome.i18n.getMessage('chatGPTApiKeyRequired'));
            return;
        }
        const prompt = this.getIELTSReadingPrompt(settings.targetTransLang);
        await this.doRequest(settings, text, prompt, onMessage);
    }


    public getEndIdentity(): string {
        return ">[DONE]<";
    }

    private async doRequest(settings: UserSettings, text: string, prompt: string, onMessage: (message: string) => void) {
        const openai = this.createOpenAIClient(settings);

        const stream = await openai.chat.completions.create({
            model: settings.llmMode ?? "gpt-3.5-turbo-1106",
            messages: [{
                role: "system",
                content: prompt,
            },
            {
                role: "user",
                content: text,
            }
            ],
            stream: true,
            temperature: 0.9,
        });

        let responseText = "";

        for await (const chunk of stream) {
            const words = chunk.choices[0]?.delta?.content || '';
            if (words !== undefined) {
                responseText += words;
                onMessage(responseText);
            }
        }
        onMessage(this.getEndIdentity());
    }

    private createOpenAIClient(settings: UserSettings) {
        return new OpenAI({
            apiKey: settings.apiKey,
            baseURL: settings.useProxy ? (settings.proxyUrl || '') : undefined,
            defaultHeaders: settings.useCustomHeaders ? (settings.customHeaders || {}) : undefined,
            dangerouslyAllowBrowser: true,
            timeout: TIME_OUT_MS,
        });
    }

    protected getTranslationPrompt(targetLang: TargetLanguage): string {
        const prompt = `Please translate my text into clear ${targetLang}, adding nuances to seem less like machine translation. Only translate, no other output.`
        return prompt
    }

    protected getSummaryPrompt(targetLang: TargetLanguage): string {
        const prompt = `Please summarize the following text is in easy-to-understand ${targetLang}. The text can be appropriately polished to avoid the suspicion of machine translation.`
        return prompt
    }

    protected getIELTSReadingPrompt(targetLang: TargetLanguage): string {
        const prompt = `You are an experienced IELTS reading coach with extensive English and test preparation knowledge, I need your help with an English passage. Please:
        1, Translate it into easy-to-understand ${targetLang}.
        2, Identify and explain any challenging or error-prone sentences, including their translation and associated grammatical aspects.
        3, Highlight key IELTS vocabulary and their phonetics in the passage, or state if none are present.
        In the output text, please use ${targetLang} for titles and tips.`
        return prompt
    }
}
