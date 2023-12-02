import { ChatGPTTranslator } from "./chatgpt_translator";

export enum TranslatorType {
  ChatGPT = 'ChatGPT',
}

export enum TargetLanguage {
  Chinese = 'Chinese',
  English = 'English',
  Japanese = 'Japanese',
  Spanish = 'Spanish',
  French = 'French',
  German = 'German',
}

export interface Translator {
  translate(text: string, onMessage: (message: string) => void): void;
  getEndIdentity(): string;
}

export const createTranslator = (type: TranslatorType): Translator => {
  switch (type) {
    case TranslatorType.ChatGPT:
      return new ChatGPTTranslator();
    default:
      throw new Error('Invalid translator type');
  }
};
