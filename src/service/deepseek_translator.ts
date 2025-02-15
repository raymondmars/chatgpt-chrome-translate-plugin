import OpenAI from 'openai';

import { OutputFormat, TargetLanguage, TranslateMessageType, Translator, TranslatorType } from "./translator";
import { TranslateStore } from './store';

const TIME_OUT_MS = 60000;

export class DeepSeekTranslator implements Translator {

    private shouldBeRemovedCharacters = ['```html', '```', 'html']

    public async translate(text: string, targetLng: TargetLanguage, outputFormat: OutputFormat, onMessage: (message: string, type?: TranslateMessageType) => void) {
        const settings = await TranslateStore.getUserSettings();

        const apiKey = settings.translatorAPIKeys[TranslatorType.DeepSeek] || '';
        if(apiKey === '') {
            onMessage(chrome.i18n.getMessage('deepSeekApiKeyRequired'), TranslateMessageType.Error);
            return;
        }

        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: settings.useProxy && settings.proxyUrl?.trim() !== '' ? settings.proxyUrl : 'https://api.deepseek.com/',
            defaultHeaders: settings.useCustomHeaders ? (settings.customHeaders || {}) : undefined,
            dangerouslyAllowBrowser: true,
            timeout: TIME_OUT_MS,
        });

        const stream = await openai.chat.completions.create({
            model: settings.llmMode ?? "deepseek-chat",
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
            const words = chunk.choices[0]?.delta?.content || ''
            if (words !== undefined && this.shouldBeRemovedCharacters.indexOf(words.trim()) === -1) {
              responseText += words;
              onMessage(responseText, TranslateMessageType.Message);
            }
        }
        onMessage('', TranslateMessageType.End);
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
