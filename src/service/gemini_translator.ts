import OpenAI from 'openai';

import { OutputFormat, TargetLanguage, TranslateMessageType, Translator, TranslatorType } from "./translator";
import { TranslateStore } from './store';
import { extractAPIErrorMessage } from './error_utils';
import { TranslationCache } from './translation_cache';

const TIME_OUT_MS = 60000;

export class GeminiTranslator implements Translator {

    private shouldBeRemovedCharacters = ['```html', '```', 'html']

    public async translate(text: string, targetLng: TargetLanguage, outputFormat: OutputFormat, onMessage: (message: string, type?: TranslateMessageType) => void) {
        const settings = await TranslateStore.getUserSettings();

        const apiKey = settings.translatorAPIKeys[TranslatorType.Gemini].trim()
        if(apiKey === '') {
          onMessage(chrome.i18n.getMessage('geminiApiKeyRequired'), TranslateMessageType.Error);
          return;
        }

        const textHash = await TranslationCache.generateHash(text);
        const cached = await TranslationCache.get(textHash, targetLng, outputFormat, TranslatorType.Gemini);
        if(cached) {
            onMessage(cached, TranslateMessageType.Message);
            onMessage('', TranslateMessageType.End);
            return;
        }

        let headers = settings.useCustomHeaders ? (settings.customHeaders || {}) : undefined;
        
        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: settings.useProxy && settings.proxyUrl?.trim() !== '' ? settings.proxyUrl : 'https://geminiproxy.raymondjiang.net/v1beta/openai/',
            defaultHeaders: headers,
            dangerouslyAllowBrowser: true,
            timeout: TIME_OUT_MS,
        });

        const modelName = settings.llmMode ?? "gemini-2.0-flash";

        try {
            const stream = await openai.chat.completions.create({
                model: modelName,
                messages: [{
                    role: "system",
                    content: this.getPrompt(targetLng, outputFormat, settings.generalAreaDialect),
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
                let words = chunk.choices[0]?.delta?.content || ''
                words = words.replace(/html\n/g, '');
                words = words.replace(/```/g, '');
                if (words !== undefined && this.shouldBeRemovedCharacters.indexOf(words.trim()) === -1) {
                  responseText += words;
                  onMessage(responseText, TranslateMessageType.Message);
                }
            }
            if(responseText.trim() !== '') {
                await TranslationCache.set(textHash, targetLng, outputFormat, TranslatorType.Gemini, responseText);
            }
            onMessage('', TranslateMessageType.End);
        } catch (error) {
            const message = extractAPIErrorMessage(error);
            const formatted = `${TranslatorType.Gemini} (${modelName}) - ${message}`;
            onMessage(formatted, TranslateMessageType.Error);
        }
    }

    protected getPrompt(targetLang: TargetLanguage, outputFormat: OutputFormat, dialect?: string): string {

        const plainTextPrompt = `You are a translation expert, Please translate my text into easy to understand ${targetLang}, avoid machine translation sense. Only translate, no other output.`;

        const chinesePrompt = `你是一个翻译专家，你可以翻译很多中国方言。请将以下文字翻译成风趣幽默的${dialect}。`;

        switch (outputFormat) {
            case OutputFormat.HTML:
                if(targetLang === TargetLanguage.ChineseCN && dialect && dialect.trim() !== '') {
                    return `${chinesePrompt} 以HTML格式输出,并保留原文的段落格式。除此之外不要输出其他不相关的内容。`;
                }
                return `You are a translation expert, Please translate my text into easy to understand ${targetLang}, avoid machine translation sense. Output in HTML format and keep the paragraph formatting of the original text.`;
            case OutputFormat.PlainText:
                if(targetLang === TargetLanguage.ChineseCN && dialect && dialect.trim() !== '') {
                    return `${chinesePrompt} 只翻译，不要输出其他内容。`;
                }
                return plainTextPrompt;
            default:
                return plainTextPrompt;
        }
    }
}
