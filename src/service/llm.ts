import { ChatGPT } from "./chatgpt";


export enum LLMType {
  ChatGPT = 'ChatGPT',
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

export interface LLM {
  translate(text: string, onMessage: (message: string) => void): void;
  summary(text: string, onMessage: (message: string) => void): void;
  ieltsReading(text: string, onMessage: (message: string) => void): void;
  
  getEndIdentity(): string;
}

export const createLLM = (type: LLMType): LLM => {
  switch (type) {
    case LLMType.ChatGPT:
      return new ChatGPT();
    default:
      throw new Error('Invalid translator type');
  }
};
