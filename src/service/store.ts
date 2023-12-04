import { TargetLanguage, LLMType } from './llm';

export interface UserSettings {
  apiKey: string;
  llmMode?: string;
  useProxy: boolean;
  proxyUrl?: string;
  useCustomHeaders: boolean;
  customHeaders?: Record<string, string>;
  targetTransLang: TargetLanguage;
  llmType: LLMType;
}

export interface Store {
  getUserSettings(): Promise<UserSettings>;
  setUserSettings(settings: UserSettings): void;
}

function getFromStorage(key: string): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key]);
      }
    });
  });
}

const USER_SETTINGS_KEY = '__chrom_plugin_userSettings';

class SettingsStore implements Store {
  async getUserSettings(): Promise<UserSettings> {
    const settings = await getFromStorage(USER_SETTINGS_KEY);
    if (settings) {
      return JSON.parse(settings) as UserSettings;
    }

    return {
      apiKey: '',
      useProxy: false,
      useCustomHeaders: false,
      targetTransLang: TargetLanguage.English,
      llmType: LLMType.ChatGPT,
    };
  }

  setUserSettings(settings: UserSettings): void {
    chrome.storage.local.set({[USER_SETTINGS_KEY]: JSON.stringify(settings)}, () => {
      console.log('settings saved.',chrome.runtime.lastError)
    });
  }
}

export const LLMStore = new SettingsStore();
