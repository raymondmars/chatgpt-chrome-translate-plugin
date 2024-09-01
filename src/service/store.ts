import { TargetLanguage, TranslatorType } from './translator';
import { DEFAULT_EDITABLE_SHORT_CUT, DEFAULT_GENERAL_SHORT_CUT, DEFAULT_HOVER_ONOFF_SHORT_CUT } from './utils';

export enum TextSelectionMethod {
  MouseSelection = 1,
  HoverOverText = 2,
}

export interface UserSettings {
  apiKey: string;
  llmMode: string;
  useProxy: boolean;
  proxyUrl?: string;
  useCustomHeaders: boolean;
  customHeaders?: Record<string, string>;
  targetTransLang: TargetLanguage;
  editAareTargetTransLang: TargetLanguage;
  translatorType: TranslatorType;
  translateShortCut: string;
  translateInEditableShortCut: string;
  selectionMethod: TextSelectionMethod;
  hoverOnOffShortCut: string;
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
      cacheVal.selectionMethod = cacheVal.selectionMethod || TextSelectionMethod.MouseSelection;
      cacheVal.hoverOnOffShortCut = cacheVal.hoverOnOffShortCut || DEFAULT_HOVER_ONOFF_SHORT_CUT;
      return cacheVal;
    }

    return {
      apiKey: '',
      useProxy: false,
      useCustomHeaders: false,
      targetTransLang: TargetLanguage.English,
      editAareTargetTransLang: TargetLanguage.English,
      translatorType: TranslatorType.ChatGPT,
      llmMode: 'gpt-4o-mini',
      translateShortCut: DEFAULT_GENERAL_SHORT_CUT,
      translateInEditableShortCut: DEFAULT_EDITABLE_SHORT_CUT,
      selectionMethod: TextSelectionMethod.MouseSelection,
      hoverOnOffShortCut: DEFAULT_HOVER_ONOFF_SHORT_CUT,
    };
  }

  setUserSettings(settings: UserSettings): void {
    chrome.storage.sync.set({[USER_SETTINGS_KEY]: JSON.stringify(settings)}, () => {
      console.log('settings saved.',chrome.runtime.lastError)
    });
  }
}

export const TranslateStore = new UserStore();
