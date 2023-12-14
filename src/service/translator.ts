import { ChatGPTTranslator } from "./chatgpt_translator";

export enum TranslatorType {
  ChatGPT = 'ChatGPT',
}

export enum TranslateMessageType {
  Message = 1,
  End  = 2,
  Error = 0,
}

export enum TargetLanguage {
  Arabic = "Arabic",
  Bulgarian = "Bulgarian",
  ChineseCN = "Chinese",
  ChineseTW = "traditional Chinese",
  Croatian = "Croatian",
  Czech = "Czech",
  Danish = "Danish",
  Dutch = "Dutch",
  English = "English",
  Finnish = "Finnish",
  French = "French",
  German = "German",
  Greek = "Greek",
  Hungarian = "Hungarian",
  Indonesian = "Indonesian",
  Italian = "Italian",
  Japanese = "Japanese",
  Korean = "Korean",
  Norwegian = "Norwegian",
  Polish = "Polish",
  Portuguese = "Portuguese",
  Romanian = "Romanian",
  Russian = "Russian",
  Slovak = "Slovak",
  Slovenian = "Slovenian",
  Spanish = "Spanish",
  Swedish = "Swedish",
  Thai = "Thai",
  Turkish = "Turkish",
}

export interface Translator {
  translate(text: string, onMessage: (message: string, type?: TranslateMessageType) => void): void;
  // getEndIdentity(): string;
}

export const createTranslator = (type: TranslatorType): Translator => {
  switch (type) {
    case TranslatorType.ChatGPT:
      return new ChatGPTTranslator();
    default:
      throw new Error('Invalid translator type');
  }
};
