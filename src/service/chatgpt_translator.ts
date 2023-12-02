import OpenAI from 'openai';

import { TargetLanguage, Translator } from "./translator";

const TIME_OUT_MS = 60000;

export class ChatGPTTranslator implements Translator {
    public async translate(text: string, onMessage: (message: string) => void) {
        const openai = new OpenAI({
            apiKey: "",
            baseURL: `https://gpt.navitechai.com/v1/`,
            defaultHeaders: { 'X-Access-Code': "admin@admin.com" },
            dangerouslyAllowBrowser: true,
            timeout: TIME_OUT_MS,
        });
              
        const stream = await openai.chat.completions.create({
            model:  "gpt-3.5-turbo",
            // model:  "gpt-4",
            messages: [{
                role: "system",
                content: this.getPrompt(TargetLanguage.Chinese),
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
        const prompt = `You are a translation expert, you've been involved in translating a variety of books and newspaper articles. Please translate the text I enter into easy-to-understand ${targetLang}, with appropriate embellishments to avoid the suspicion of machine translation.`
        return prompt
        // return `
        // 你是一个翻译专家, 参与过各类书籍和报纸文章的翻译，请将我输入的文字翻译成通俗易懂的中文, 可以进行适当的润色，尽量避免机器翻译的嫌疑。
        // `;
    }
}
