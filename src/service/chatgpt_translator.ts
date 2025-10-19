import OpenAI from 'openai';

import { OutputFormat, TargetLanguage, TranslateMessageType, Translator, TranslatorType } from "./translator";
import { TranslateStore } from './store';
import { extractAPIErrorMessage } from './error_utils';
import { TranslationCache } from './translation_cache';

const TIME_OUT_MS = 60000;

export class ChatGPTTranslator implements Translator {

    private shouldBeRemovedCharacters = ['```html', '```', 'html']

    public async translate(text: string, targetLng: TargetLanguage, outputFormat: OutputFormat, onMessage: (message: string, type?: TranslateMessageType) => void) {
        const settings = await TranslateStore.getUserSettings();

        const apiKey = settings.translatorAPIKeys[TranslatorType.ChatGPT] || settings.apiKey
        if(apiKey === '') {
            onMessage(chrome.i18n.getMessage('chatGPTApiKeyRequired'), TranslateMessageType.Error);
            return;
        }

        const textHash = await TranslationCache.generateHash(text);
        const cached = await TranslationCache.get(textHash, targetLng, outputFormat, TranslatorType.ChatGPT);
        if(cached) {
            onMessage(cached, TranslateMessageType.Message);
            onMessage('', TranslateMessageType.End);
            return;
        }

        const modelName = settings.llmMode ?? "gpt-4o-mini";

        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: settings.useProxy ? (settings.proxyUrl || '') : undefined,
            defaultHeaders: settings.useCustomHeaders ? (settings.customHeaders || {}) : undefined,
            dangerouslyAllowBrowser: true,
            timeout: TIME_OUT_MS,
        });

        try {
            const stream = await openai.chat.completions.create({
                model: modelName,
                messages: [{
                    role: "system",
                    content: this.getPrompt(targetLng, outputFormat),
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
                if (words !== undefined && this.shouldBeRemovedCharacters.indexOf(words.trim()) === -1) {
                  responseText += words;
                  onMessage(responseText, TranslateMessageType.Message);
                }
            }
            if(responseText.trim() !== '') {
                await TranslationCache.set(textHash, targetLng, outputFormat, TranslatorType.ChatGPT, responseText);
            }
            onMessage('', TranslateMessageType.End);
        } catch (error) {
            const message = extractAPIErrorMessage(error);
            const formatted = `${TranslatorType.ChatGPT} (${modelName}) - ${message}`;
            onMessage(formatted, TranslateMessageType.Error);
        }
    }

    // public getEndIdentity(): string {
    //     return ">[DONE]<";
    // }

    protected getPrompt(targetLang: TargetLanguage, outputFormat: OutputFormat): string {
        const plainTextPrompt = `You are a translation expert, Please translate my text into easy to understand ${targetLang}, avoid machine translation sense. Only translate, no other output.`;

        switch (outputFormat) {
            case OutputFormat.HTML:
                return `You are a translation expert, Please translate my text into easy to understand ${targetLang}, avoid machine translation sense. Output in HTML format and keep the paragraph formatting of the original text.`;
            case OutputFormat.PlainText:
                return plainTextPrompt;
            default:
                return plainTextPrompt;
        }
    }
}
