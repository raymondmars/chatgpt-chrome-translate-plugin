import OpenAI from 'openai';

import { TargetLanguage, TranslateMessageType, Translator } from "./translator";
import { TranslateStore } from './store';

const TIME_OUT_MS = 60000;

export class ChatGPTTranslator implements Translator {

    public async translate(text: string, onMessage: (message: string, type?: TranslateMessageType) => void) {
        const settings = await TranslateStore.getUserSettings();

        if(settings.apiKey.trim() === '') {
            onMessage(chrome.i18n.getMessage('chatGPTApiKeyRequired'), TranslateMessageType.Error);
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
            model: settings.llmMode ?? "gpt-4o-mini",
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
              onMessage(responseText, TranslateMessageType.Message);
            }
        }
        onMessage('', TranslateMessageType.End);
    }

    // public getEndIdentity(): string {
    //     return ">[DONE]<";
    // }

    protected getPrompt(targetLang: TargetLanguage): string {
        const prompt = `You are a translation expert, Please translate my text into easy to understand ${targetLang}, adding nuances to seem less like machine translation. Only translate, no other output.`;
        return prompt
    }
}
