import OpenAI from 'openai';

import { TargetLanguage, Translator } from "./translator";
import { TranslateStore } from './store';

const TIME_OUT_MS = 60000;

export class ChatGPTTranslator implements Translator {

    public async translate(text: string, onMessage: (message: string) => void) {
        const settings = await TranslateStore.getUserSettings();

        if(settings.apiKey.trim() === '') {
            onMessage(chrome.i18n.getMessage('chatGPTApiKeyRequired'));
            return;
        }

        const openai = new OpenAI({
            apiKey: settings.apiKey,
            baseURL: settings.useProxy ? (settings.proxyUrl || '') : undefined,
            defaultHeaders: settings.useCustomHeaders ? (settings.customHeaders || {}) : undefined,
            dangerouslyAllowBrowser: true,
            timeout: TIME_OUT_MS,
        });
              
        const stream = await openai.chat.completions.create({
            model: settings.llmMode ?? "gpt-3.5-turbo-1106",
            messages: [{
                role: "system",
                content: this.getPrompt(settings.targetTransLang),
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
            const words = chunk.choices[0]?.delta?.content || ''
            if (words !== undefined) {
              responseText += words;
              onMessage(responseText);
            }
        }
        onMessage(this.getEndIdentity());
    }

    public getEndIdentity(): string {
        return ">[DONE]<";
    }

    protected getPrompt(targetLang: TargetLanguage): string {
        const prompt = `Please translate my text into clear ${targetLang}, adding nuances to seem less like machine translation. Only translate, no other output.`
        console.log('use prompt: ', prompt)
        return prompt
    }
}
