import { TargetLanguage, TranslatorType } from './translator';

export interface UserSettings {
  apiKey: string;
  llmMode: string;
  useProxy: boolean;
  proxyUrl?: string;
  useCustomHeaders: boolean;
  customHeaders?: Record<string, string>;
  targetTransLang: TargetLanguage;
  translatorType: TranslatorType;
  showMenu: boolean;
}

export interface Store {
  getUserSettings(): Promise<UserSettings>;
  setUserSettings(settings: UserSettings): void;
}

function getFromStorage(key: string): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key]);
      }
    });
  });
}

const USER_SETTINGS_KEY = '__chrom_plugin_userSettings';

class UserStore implements Store {
  async getUserSettings(): Promise<UserSettings> {
    const settings = await getFromStorage(USER_SETTINGS_KEY);
    if (settings) {
      let cacheVal = JSON.parse(settings) as UserSettings;
      if(cacheVal.showMenu === undefined) {
        cacheVal.showMenu = true
      }
      return cacheVal
    }

    return {
      apiKey: '',
      useProxy: false,
      useCustomHeaders: false,
      targetTransLang: TargetLanguage.English,
      translatorType: TranslatorType.ChatGPT,
      llmMode: 'gpt-3.5-turbo-0125',
      showMenu: false,
    };
  }

  setUserSettings(settings: UserSettings): void {
    chrome.storage.sync.set({[USER_SETTINGS_KEY]: JSON.stringify(settings)}, () => {
      console.log('settings saved.',chrome.runtime.lastError)
    });
  }
}

export const TranslateStore = new UserStore();
