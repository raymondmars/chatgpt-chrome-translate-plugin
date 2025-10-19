import { TranslatorType } from "./translator";
import { UserSettings } from "./store";

export interface DiagnosticResult {
  success: boolean;
  message: string;
}

const DEFAULT_ENDPOINTS: Record<TranslatorType, string> = {
  [TranslatorType.ChatGPT]: "https://api.openai.com/v1",
  [TranslatorType.DeepSeek]: "https://api.deepseek.com",
  [TranslatorType.Gemini]: "https://geminiproxy.raymondjiang.net/v1beta/openai",
};

const FALLBACK_MODEL: Record<TranslatorType, string> = {
  [TranslatorType.ChatGPT]: "gpt-4o-mini",
  [TranslatorType.DeepSeek]: "deepseek-chat",
  [TranslatorType.Gemini]: "gemini-1.5-flash",
};

const normalizeUrl = (baseUrl: string, path: string) => {
  const trimmedBase = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${trimmedBase}${normalizedPath}`;
};

const collectHeaders = (
  settings: UserSettings,
  apiKey: string
): Record<string, string> => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  };

  if (settings.useCustomHeaders && settings.customHeaders) {
    Object.keys(settings.customHeaders).forEach((key) => {
      const value = settings.customHeaders?.[key];
      if (value !== undefined) {
        headers[key] = value;
      }
    });
  }

  return headers;
};

const inferApiKey = (
  settings: UserSettings,
  type: TranslatorType
): string => {
  if (type === TranslatorType.ChatGPT) {
    return (
      settings.translatorAPIKeys[TranslatorType.ChatGPT] || settings.apiKey || ""
    );
  }
  return settings.translatorAPIKeys[type] || "";
};

export const testTranslatorConnection = async (
  settings: UserSettings
): Promise<DiagnosticResult> => {
  const type = settings.translatorType || TranslatorType.ChatGPT;
  const apiKey = inferApiKey(settings, type).trim();

  if (apiKey === "") {
    return {
      success: false,
      message:
        chrome.i18n.getMessage("diagnosticMissingApiKey") ||
        "Please enter an API key before testing.",
    };
  }

  const baseUrl =
    (settings.useProxy && settings.proxyUrl?.trim() !== ""
      ? settings.proxyUrl!.trim()
      : DEFAULT_ENDPOINTS[type]) || DEFAULT_ENDPOINTS[TranslatorType.ChatGPT];

  const targetUrl = normalizeUrl(baseUrl, "chat/completions");
  const headers = collectHeaders(settings, apiKey);
  headers["Content-Type"] = "application/json";

  const model =
    settings.llmMode && settings.llmMode.trim() !== ""
      ? settings.llmMode.trim()
      : FALLBACK_MODEL[type];

  const payload = {
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a system used to verify API connectivity. Answer with a short acknowledgement.",
      },
      {
        role: "user",
        content: "ping",
      },
    ],
    max_tokens: 1,
    stream: false,
    temperature: 0,
  };

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return {
        success: true,
        message:
          chrome.i18n.getMessage("diagnosticSuccess") ||
          "Connection successful.",
      };
    }

    let detail = response.statusText;
    try {
      const text = await response.text();
      if (text) {
        try {
          const parsed = JSON.parse(text);
          detail =
            parsed?.error?.message ||
            parsed?.message ||
            response.statusText ||
            text;
        } catch {
          detail = text;
        }
      }
    } catch {
      // ignore body parsing failures
    }

    const failedMessage =
      chrome.i18n.getMessage("diagnosticFailed") || "Connection failed.";
    return {
      success: false,
      message: `${failedMessage} ${detail}`.trim(),
    };
  } catch (error) {
    const failedMessage =
      chrome.i18n.getMessage("diagnosticFailed") || "Connection failed.";
    const extra =
      error instanceof Error ? error.message : String(error || "");
    return {
      success: false,
      message: `${failedMessage} ${extra}`.trim(),
    };
  }
};
