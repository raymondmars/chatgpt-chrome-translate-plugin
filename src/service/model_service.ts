import defaultModelList from '../static/model-list.json';
import { TranslatorType } from './translator';
import { UserSettings } from './store';
import { extractAPIErrorMessage } from './error_utils';

export interface ModelOption {
  value: string;
  label: string;
}

export type ModelList = Record<TranslatorType, ModelOption[]>;

const STORAGE_KEY = '__translator_model_list';

const REMOTE_MODEL_LIST_URL =
  'https://raw.githubusercontent.com/raymondmars/translate-everything/main/src/static/model-list.json';

const DEFAULT_MODEL_LIST = defaultModelList as ModelList;

const normalizeOptions = (options?: unknown): ModelOption[] => {
  if (!Array.isArray(options)) {
    return [];
  }

  const normalized: ModelOption[] = [];
  options.forEach((item) => {
    if (item && typeof item === 'object') {
      const opt = item as Record<string, unknown>;
      const value = typeof opt.value === 'string' ? opt.value.trim() : '';
      if (value !== '') {
        const label =
          typeof opt.label === 'string' && opt.label.trim() !== ''
            ? opt.label.trim()
            : value;
        normalized.push({ value, label });
      }
    }
  });

  return normalized;
};

const sanitizeModelList = (list: Partial<Record<string, unknown>>): ModelList => {
  const sanitized: ModelList = {
    [TranslatorType.ChatGPT]: [...DEFAULT_MODEL_LIST[TranslatorType.ChatGPT]],
    [TranslatorType.DeepSeek]: [...DEFAULT_MODEL_LIST[TranslatorType.DeepSeek]],
    [TranslatorType.Gemini]: [...DEFAULT_MODEL_LIST[TranslatorType.Gemini]],
  };

  Object.values(TranslatorType).forEach((type) => {
    const rawOptions = list[type];
    const normalized = normalizeOptions(rawOptions);
    if (normalized.length > 0) {
      sanitized[type] = normalized;
    }
  });

  return sanitized;
};

const getFromStorage = (): Promise<ModelList | null> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) {
        resolve(null);
        return;
      }
      const cached = result[STORAGE_KEY];
      if (!cached) {
        resolve(null);
        return;
      }

      try {
        const parsed = JSON.parse(cached) as Partial<Record<string, unknown>>;
        resolve(sanitizeModelList(parsed));
      } catch {
        resolve(null);
      }
    });
  });
};

const setToStorage = (modelList: ModelList): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.sync.set(
      {
        [STORAGE_KEY]: JSON.stringify(modelList),
      },
      () => {
        resolve();
      }
    );
  });
};

const deepCloneModelList = (list: ModelList): ModelList => {
  return {
    [TranslatorType.ChatGPT]: list[TranslatorType.ChatGPT].map((opt) => ({
      ...opt,
    })),
    [TranslatorType.DeepSeek]: list[TranslatorType.DeepSeek].map((opt) => ({
      ...opt,
    })),
    [TranslatorType.Gemini]: list[TranslatorType.Gemini].map((opt) => ({
      ...opt,
    })),
  };
};

export const ModelService = {
  getDefaultModelList(): ModelList {
    return deepCloneModelList(DEFAULT_MODEL_LIST);
  },

  async getModelList(): Promise<ModelList> {
    const cached = await getFromStorage();
    if (cached) {
      return cached;
    }
    return this.getDefaultModelList();
  },

  async updateModelListForTranslator(
    translatorType: TranslatorType
  ): Promise<ModelList> {
    let remoteList: ModelList | null = null;

    try {
      const response = await fetch(REMOTE_MODEL_LIST_URL, { method: 'GET' });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch model list. Status: ${response.status}`
        );
      }
      const json = (await response.json()) as Partial<Record<string, unknown>>;
      remoteList = sanitizeModelList(json);
    } catch (error) {
      const message = extractAPIErrorMessage(error);
      throw new Error(message);
    }

    const currentList = await this.getModelList();
    const updatedList = deepCloneModelList(currentList);

    updatedList[translatorType] =
      remoteList[translatorType] && remoteList[translatorType].length > 0
        ? remoteList[translatorType]
        : currentList[translatorType];

    await setToStorage(updatedList);

    return updatedList;
  },

  async setModelList(modelList: ModelList): Promise<void> {
    await setToStorage(modelList);
  },

  ensureValidModelSelection(
    settings: UserSettings,
    modelList: ModelList
  ): { settings: UserSettings; changed: boolean } {
    const translator = settings.translatorType || TranslatorType.ChatGPT;
    const models = modelList[translator] || [];
    if (models.length === 0) {
      return { settings, changed: false };
    }

    const exists = models.some((model) => model.value === settings.llmMode);
    if (exists) {
      return { settings, changed: false };
    }

    const firstModel = models[0];
    const updatedSettings: UserSettings = {
      ...settings,
      llmMode: firstModel.value,
    };
    return { settings: updatedSettings, changed: true };
  },

  getModelsForTranslator(
    translatorType: TranslatorType,
    modelList: ModelList
  ): ModelOption[] {
    const models = modelList[translatorType] || [];
    if (models.length === 0) {
      return DEFAULT_MODEL_LIST[translatorType];
    }
    return models;
  },

  getFirstModelValue(
    translatorType: TranslatorType,
    modelList: ModelList
  ): string {
    const models = this.getModelsForTranslator(translatorType, modelList);
    if (models.length === 0) {
      return '';
    }
    return models[0].value;
  },
};
