import { TargetLanguage, OutputFormat, TranslatorType } from "./translator";

interface CacheEntry {
  key: string;
  value: string;
  lang: TargetLanguage;
  format: OutputFormat;
  translator: TranslatorType;
  hash: string;
  timestamp: number;
}

interface CacheStore {
  entries: CacheEntry[];
  maxSize: number;
}

const STORAGE_KEY = "__translator_cache_entries__";
const DEFAULT_MAX_ENTRIES = 500;

const encoder = new TextEncoder();

const trimEdgePunctuationRegex = /^(?:[\s\p{P}\p{S}]+)|(?:[\s\p{P}\p{S}]+)$/gu;

function normalizeTextForHash(text: string): string {
  if (!text) {
    return "";
  }
  const trimmed = text.trim();
  const normalized = trimmed.replace(trimEdgePunctuationRegex, "");
  return normalized.trim() || trimmed;
}

async function sha1(input: string): Promise<string> {
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function buildKey(
  hash: string,
  lang: TargetLanguage,
  format: OutputFormat,
  translator: TranslatorType
): string {
  return `${hash}|${lang}|${format}|${translator}`;
}

function getInitialStore(): CacheStore {
  return {
    entries: [],
    maxSize: DEFAULT_MAX_ENTRIES,
  };
}

function normalizeStore(store: unknown): CacheStore {
  if (!store || typeof store !== "object") {
    return getInitialStore();
  }
  const record = store as Partial<CacheStore>;
  const maxSize =
    typeof record.maxSize === "number" && record.maxSize > 0
      ? record.maxSize
      : DEFAULT_MAX_ENTRIES;
  const entries: CacheEntry[] = Array.isArray(record.entries)
    ? record.entries
        .filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof (item as CacheEntry).key === "string" &&
            typeof (item as CacheEntry).value === "string" &&
            typeof (item as CacheEntry).lang === "string" &&
            typeof (item as CacheEntry).format === "string" &&
            typeof (item as CacheEntry).translator === "string" &&
            typeof (item as CacheEntry).hash === "string" &&
            typeof (item as CacheEntry).timestamp === "number"
        )
        .map((item) => item as CacheEntry)
    : [];
  return {
    entries,
    maxSize,
  };
}

function saveStore(store: CacheStore): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: store }, () => resolve());
  });
}

function getStore(): Promise<CacheStore> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) {
        resolve(getInitialStore());
        return;
      }
      resolve(normalizeStore(result[STORAGE_KEY]));
    });
  });
}

function touchEntry(store: CacheStore, entry: CacheEntry): void {
  store.entries = store.entries.filter((item) => item.key !== entry.key);
  store.entries.push(entry);
  if (store.entries.length > store.maxSize) {
    store.entries = store.entries.slice(store.entries.length - store.maxSize);
  }
}

export const TranslationCache = {
  async generateHash(text: string): Promise<string> {
    const normalized = normalizeTextForHash(text);
    return sha1(normalized);
  },

  async get(
    textHash: string,
    targetLang: TargetLanguage,
    format: OutputFormat,
    translator: TranslatorType
  ): Promise<string | null> {
    const store = await getStore();
    const lookupKey = buildKey(textHash, targetLang, format, translator);
    const entry = store.entries.find((item) => item.key === lookupKey);
    if (!entry) {
      return null;
    }
    entry.timestamp = Date.now();
    touchEntry(store, entry);
    await saveStore(store);
    return entry.value;
  },

  async set(
    textHash: string,
    targetLang: TargetLanguage,
    format: OutputFormat,
    translator: TranslatorType,
    translatedText: string
  ): Promise<void> {
    const store = await getStore();
    const now = Date.now();
    const lookupKey = buildKey(textHash, targetLang, format, translator);
    const newEntry: CacheEntry = {
      key: lookupKey,
      value: translatedText,
      lang: targetLang,
      format,
      translator,
      hash: textHash,
      timestamp: now,
    };
    touchEntry(store, newEntry);
    await saveStore(store);
  },

  async clear(): Promise<void> {
    await saveStore(getInitialStore());
  },
};
