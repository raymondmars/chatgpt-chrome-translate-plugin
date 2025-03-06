import React, { useEffect } from "react";

import styles from "./settings.scss";
import {
  TextSelectionMethod,
  TranslateStore,
  UserSettings,
} from "../service/store";
import { TargetLanguage, TranslatorType } from "../service/translator";
import { testTranslatorConnection } from "../service/diagnostic";
import { ModelService, ModelList } from "../service/model_service";

import CustomHeaders from "./custom_headers";
import {
  DEFAULT_EDITABLE_SHORT_CUT,
  DEFAULT_GENERAL_SHORT_CUT,
  DEFAULT_HOVER_ONOFF_SHORT_CUT,
} from "../service/utils";

const TranslatorDefaultModel: Record<TranslatorType, string> = {
  [TranslatorType.ChatGPT]: "gpt-4o-mini",
  [TranslatorType.DeepSeek]: "deepseek-chat",
  [TranslatorType.Gemini]: "gemini-1.5-flash",
};

const ChineseDialectOptions = () => {
  return (
    <>
      <option value="">普通话</option>
      <option value="上海话">上海话</option>
      <option value="北京话">北京话</option>
      <option value="四川话">四川话</option>
      <option value="重庆话">重庆话</option>
      <option value="天津话">天津话</option>
      <option value="东北话">东北话</option>
      <option value="河南话">河南话</option>
      <option value="陕西话">陕西话</option>
      <option value="山东话">山东话</option>
      <option value="山西话">山西话</option>
      <option value="湖南话">湖南话</option>
      <option value="湖北话">湖北话</option>
      <option value="粤语">粤语</option>
      <option value="闽南语">闽南语</option>
      <option value="文言文">文言文</option>
    </>
  );
};

const Settings = () => {
  const [disableSaveButton, setDisableSaveButton] =
    React.useState<boolean>(true);
  const [userSettings, setUserSettings] = React.useState<UserSettings>({
    apiKey: "",
    useProxy: false,
    useCustomHeaders: false,
    targetTransLang: TargetLanguage.English,
    editAareTargetTransLang: TargetLanguage.English,
    translatorType: TranslatorType.ChatGPT,
    llmMode: "gpt-4o-mini",
    translateShortCut: DEFAULT_GENERAL_SHORT_CUT,
    translateInEditableShortCut: DEFAULT_EDITABLE_SHORT_CUT,
    selectionMethod: TextSelectionMethod.MouseSelection,
    hoverOnOffShortCut: DEFAULT_HOVER_ONOFF_SHORT_CUT,
    translatorAPIKeys: {
      [TranslatorType.ChatGPT]: "",
      [TranslatorType.DeepSeek]: "",
      [TranslatorType.Gemini]: "",
    },
  });
  const [isTestingConnection, setIsTestingConnection] =
    React.useState<boolean>(false);
  const [diagnosticMessage, setDiagnosticMessage] = React.useState<
    string | null
  >(null);
  const [diagnosticStatus, setDiagnosticStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [modelList, setModelList] = React.useState<ModelList>(
    ModelService.getDefaultModelList()
  );
  const [isUpdatingModels, setIsUpdatingModels] =
    React.useState<boolean>(false);
  const [updateModelMessage, setUpdateModelMessage] = React.useState<
    string | null
  >(null);
  const [updateModelStatus, setUpdateModelStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const uiConfig = {
    [TranslatorType.ChatGPT]: {
      apiAddress: "https://platform.openai.com/api-keys",
      apiKeyPlaceholder: chrome.i18n.getMessage(
        "settingsOpenAIAPIKeyPlaceholder"
      ),
    },
    [TranslatorType.DeepSeek]: {
      apiAddress: "https://platform.deepseek.com/api_keys",
      apiKeyPlaceholder: chrome.i18n.getMessage(
        "settingsDeepSeekAPIKeyPlaceholder"
      ),
    },
    [TranslatorType.Gemini]: {
      apiAddress: "https://aistudio.google.com/apikey",
      apiKeyPlaceholder: chrome.i18n.getMessage(
        "settingsGeminiAPIKeyPlaceholder"
      ),
    },
  };

  useEffect(() => {
    const funcGetUserSettings = async () => {
      const [settings, storedModelList] = await Promise.all([
        TranslateStore.getUserSettings(),
        ModelService.getModelList(),
      ]);
      setModelList(storedModelList);
      const { settings: normalizedSettings, changed } =
        ModelService.ensureValidModelSelection(settings, storedModelList);
      setUserSettings(normalizedSettings);
      if (changed) {
        TranslateStore.setUserSettings(normalizedSettings);
      }
    };
    funcGetUserSettings();
  }, []);

  const resetDiagnosticFeedback = () => {
    setDiagnosticStatus("idle");
    setDiagnosticMessage(null);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSettings({
      ...userSettings,
      translatorAPIKeys: {
        ...userSettings.translatorAPIKeys,
        [userSettings.translatorType]: e.target.value,
      },
    });
    resetDiagnosticFeedback();
  };

  const handleUseProxyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSettings({
      ...userSettings,
      useProxy: e.target.checked,
    });
    setDisableSaveButton(false);
    resetDiagnosticFeedback();
  };

  const saveShortCut = (
    e: React.KeyboardEvent<HTMLInputElement>,
    key: string,
    keyName: string
  ) => {
    if (!/^[A-Z,0-9]$/.test(key)) {
      return;
    }

    if (e.ctrlKey) key = "Ctrl + " + key;
    if (e.shiftKey) key = "Shift + " + key;
    if (e.metaKey) key = "Cmd + " + key;

    setUserSettings({
      ...userSettings,
      [keyName]: key,
    });

    setDisableSaveButton(false);
  };

  const handleTranslateShortCutChange = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    let key = e.key.toUpperCase();
    if (key === userSettings.translateInEditableShortCut) {
      return;
    }

    saveShortCut(e, key, "translateShortCut");
  };

  const handleTranslateInEditableShortCutChange = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    let key = e.key.toUpperCase();
    if (key === userSettings.translateShortCut) {
      return;
    }

    saveShortCut(e, key, "translateInEditableShortCut");
  };

  const handleHoverOnOffShortCutChange = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    let key = e.key.toUpperCase();
    if (key === userSettings.translateShortCut) {
      return;
    }

    saveShortCut(e, key, "hoverOnOffShortCut");
  };

  const handleUseCustomHeadersChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUserSettings({
      ...userSettings,
      useCustomHeaders: e.target.checked,
    });
    setDisableSaveButton(false);
    resetDiagnosticFeedback();
  };

  const handleProxyUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSettings({
      ...userSettings,
      proxyUrl: e.target.value,
    });
    setDisableSaveButton(false);
    resetDiagnosticFeedback();
  };

  const handleTranslatorTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const translatorType = e.target.value as TranslatorType;
    const models = ModelService.getModelsForTranslator(translatorType, modelList);
    const nextMode =
      models.length > 0
        ? models[0].value
        : TranslatorDefaultModel[translatorType];
    setUserSettings({
      ...userSettings,
      translatorType: translatorType,
      llmMode: nextMode,
    });

    setDisableSaveButton(false);
    resetDiagnosticFeedback();
    setUpdateModelMessage(null);
    setUpdateModelStatus("idle");
  };

  const handleLLMModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserSettings({
      ...userSettings,
      llmMode: e.target.value,
    });
    setDisableSaveButton(false);
    resetDiagnosticFeedback();
  };

  const handleCustomHeadersChange = (headers: Record<string, string>) => {
    setUserSettings({
      ...userSettings,
      customHeaders: headers,
    });
    setDisableSaveButton(false);
    resetDiagnosticFeedback();
  };

  const handleTargetTransLangChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setUserSettings({
      ...userSettings,
      targetTransLang: e.target.value as TargetLanguage,
    });
    setDisableSaveButton(false);
  };

  const handleGeneralAreaDialectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setUserSettings({
      ...userSettings,
      generalAreaDialect: e.target.value as TargetLanguage,
    });
    setDisableSaveButton(false);
  };

  const handleEditAreaTargetTransLangChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setUserSettings({
      ...userSettings,
      editAareTargetTransLang: e.target.value as TargetLanguage,
    });
    setDisableSaveButton(false);
  };

  const handleUpdateModels = async () => {
    if (isUpdatingModels) {
      return;
    }
    setIsUpdatingModels(true);
    setUpdateModelStatus("loading");
    setUpdateModelMessage(
      chrome.i18n.getMessage("updateModelsLoading") || "Updating models..."
    );
    try {
      const updatedList = await ModelService.updateModelListForTranslator(
        userSettings.translatorType
      );
      setModelList(updatedList);
      const { settings: normalizedSettings, changed } =
        ModelService.ensureValidModelSelection(userSettings, updatedList);
      setUserSettings(normalizedSettings);
      if (changed) {
        TranslateStore.setUserSettings(normalizedSettings);
      }
      setUpdateModelStatus("success");
      setUpdateModelMessage(
        chrome.i18n.getMessage("updateModelsSuccess") ||
          "Model list updated."
      );
    } catch (error) {
      setUpdateModelStatus("error");
      const message =
        error instanceof Error ? error.message : String(error);
      setUpdateModelMessage(
        `${
          chrome.i18n.getMessage("updateModelsFailed") ||
          "Failed to update models."
        } ${message}`.trim()
      );
    } finally {
      setIsUpdatingModels(false);
    }
  };

  const handleTestConnection = async () => {
    if (isTestingConnection) {
      return;
    }

    setIsTestingConnection(true);
    setDiagnosticStatus("loading");
    setDiagnosticMessage(
      chrome.i18n.getMessage("diagnosticChecking") ||
        "Testing connection..."
    );

    try {
      const result = await testTranslatorConnection(userSettings);
      setDiagnosticStatus(result.success ? "success" : "error");
      setDiagnosticMessage(result.message);
    } catch (error) {
      const failedMessage =
        chrome.i18n.getMessage("diagnosticFailed") || "Connection failed.";
      const extra =
        error instanceof Error ? error.message : String(error || "");
      setDiagnosticStatus("error");
      setDiagnosticMessage(`${failedMessage} ${extra}`.trim());
    } finally {
      setIsTestingConnection(false);
    }
  };

  const checkApiKey = () => {
    setDisableSaveButton(
      userSettings.translatorAPIKeys[userSettings.translatorType] === ""
    );
  };

  const openLink = (url: string) => {
    chrome.tabs.create({ url: url });
  };

  const handleContactUs = () => {
    chrome.tabs.create({ url: "mailto:i@raymondjiang.net" });
  };

  const handleSave = () => {
    TranslateStore.setUserSettings(userSettings);
    setDisableSaveButton(true);
    window.setTimeout(() => window.close(), 300);
  };

  const handleSelectionMethodChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUserSettings({
      ...userSettings,
      selectionMethod: parseInt(e.target.value) as TextSelectionMethod,
    });
    setDisableSaveButton(false);
  };

  const languageOptions = () => {
    return (
      <>
        <option value="Arabic">العربية</option>
        <option value="Bulgarian">Български</option>
        <option value="Chinese">简体中文</option>
        <option value="Traditional Chinese">繁體中文</option>
        <option value="Croatian">Hrvatski</option>
        <option value="Czech">Čeština</option>
        <option value="Danish">Dansk</option>
        <option value="Dutch">Nederlands</option>
        <option value="English">English</option>
        <option value="Finnish">Suomi</option>
        <option value="French">Français</option>
        <option value="German">Deutsch</option>
        <option value="Greek">Ελληνικά</option>
        <option value="Hungarian">Magyar</option>
        <option value="Indonesian">Indonesia</option>
        <option value="Italian">Italiano</option>
        <option value="Japanese">日本語</option>
        <option value="Korean">한국어</option>
        <option value="Vietnamese">Tiếng Việt</option>
        <option value="Norwegian">Norsk</option>
        <option value="Polish">Polski</option>
        <option value="Portuguese">Português</option>
        <option value="Romanian">Română</option>
        <option value="Russian">Русский</option>
        <option value="Slovak">Slovenčina</option>
        <option value="Slovenian">Slovenščina</option>
        <option value="Spanish">Español</option>
        <option value="Swedish">Svenska</option>
        <option value="Thai">ไทย</option>
        <option value="Turkish">Türkçe</option>
        <option value="Ukrainian">Українська</option>
        <option value="Persian">فارسی</option>
      </>
    );
  };

  return (
    <div className={styles.settings}>
      <div className={styles.title}>
        Translation Bot - {chrome.i18n.getMessage("settingsTitle")}
      </div>
      <div className={styles.content}>
        <ul>
          <li>
            <span>{chrome.i18n.getMessage("settingsTranslator")}</span>
            <span className={styles.models}>
              <div className={styles.modelSelectors}>
                <select
                  value={userSettings.translatorType}
                  onChange={handleTranslatorTypeChange}
                >
                  <option value="ChatGPT">ChatGPT</option>
                  <option value="DeepSeek">DeepSeek</option>
                  <option value="Gemini">Gemini</option>
                </select>
                <select
                  value={userSettings.llmMode}
                  onChange={handleLLMModeChange}
                >
                  {ModelService.getModelsForTranslator(
                    userSettings.translatorType,
                    modelList
                  ).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </span>
          </li>
          <li>
            <span>{chrome.i18n.getMessage("settingsAPIKey")}</span>
            <span>
              <input
                type="password"
                value={
                  userSettings.translatorAPIKeys[userSettings.translatorType] ||
                  ""
                }
                placeholder={
                  uiConfig[userSettings.translatorType].apiKeyPlaceholder
                }
                onChange={handleApiKeyChange}
                onBlur={checkApiKey}
              />
              {(userSettings.translatorAPIKeys[userSettings.translatorType] ||
                "") === "" && (
                <div className={styles.apikeyLink}>
                  {chrome.i18n.getMessage("getAPIKeyDesc")}:{" "}
                  <a
                    href="#"
                    onClick={() => {
                      openLink(
                        uiConfig[userSettings.translatorType].apiAddress
                      );
                    }}
                  >
                    {uiConfig[userSettings.translatorType].apiAddress}
                  </a>
                </div>
              )}
            </span>
          </li>
          <li>
            <span>{chrome.i18n.getMessage("generalTranslation")}</span>
            <span className={styles.dualLabel}>
              <div className={styles.labelgroup}>
                <label>{chrome.i18n.getMessage("shortCut")}</label>
                <label>
                  <input
                    type="text"
                    value={userSettings.translateShortCut}
                    onKeyDown={handleTranslateShortCutChange}
                  />
                </label>
                <label>{chrome.i18n.getMessage("targetLanguage")}</label>
                <label>
                  <select
                    value={userSettings.targetTransLang}
                    onChange={handleTargetTransLangChange}
                  >
                    {languageOptions()}
                  </select>
                </label>
              </div>
            </span>
          </li>

          {(userSettings.translatorType === TranslatorType.DeepSeek ||
            userSettings.translatorType === TranslatorType.Gemini) &&
            userSettings.targetTransLang === TargetLanguage.ChineseCN && (
              <li>
                <span></span>
                <span className={styles.dualLabel}>
                  <div className={styles.labelgroup}>
                    <label>
                      {chrome.i18n.getMessage("dialect")}&nbsp;&nbsp;
                    </label>
                    <label>
                      <select
                        value={userSettings.generalAreaDialect || ""}
                        onChange={handleGeneralAreaDialectChange}
                      >
                        {ChineseDialectOptions()}
                      </select>
                    </label>
                    <label></label>
                    <label></label>
                  </div>
                </span>
              </li>
            )}

          <li>
            <span>{chrome.i18n.getMessage("textSelectionMethod")}</span>
            <span className={styles.dualLabel}>
              <div className={styles.labelgroup}>
                <label>
                  <input
                    type="radio"
                    name="selectMethod"
                    checked={
                      userSettings.selectionMethod ===
                      TextSelectionMethod.MouseSelection
                    }
                    onChange={handleSelectionMethodChange}
                    value={1}
                  />{" "}
                  {chrome.i18n.getMessage("mouseSelection")}
                </label>
                <label></label>
                <label>&nbsp;&nbsp;&nbsp;&nbsp;</label>
                <label>
                  <input
                    type="radio"
                    name="selectMethod"
                    checked={
                      userSettings.selectionMethod ===
                      TextSelectionMethod.HoverOverText
                    }
                    onChange={handleSelectionMethodChange}
                    value={2}
                  />{" "}
                  {chrome.i18n.getMessage("hoverOverText")}
                </label>
              </div>
            </span>
          </li>
          {userSettings.selectionMethod ===
            TextSelectionMethod.HoverOverText && (
            <li>
              <span></span>
              <span className={styles.dualLabel}>
                <div className={styles.labelgroup}>
                  <label>&nbsp;&nbsp;</label>
                  <label>&nbsp;&nbsp;&nbsp;</label>
                  <label>{chrome.i18n.getMessage("hoverOnOffShortCut")}</label>
                  <label>
                    <input
                      className={styles.hovershortcut}
                      type="text"
                      value={userSettings.hoverOnOffShortCut}
                      onKeyDown={handleHoverOnOffShortCutChange}
                    />
                  </label>
                </div>
              </span>
            </li>
          )}
          <li>
            <span></span>
            <span className={styles.tooltip}>
              {chrome.i18n.getMessage("generalTransDesc")}
            </span>
          </li>
          <li className={styles.divider}></li>
          <li>
            <span>{chrome.i18n.getMessage("editableAreaTranslation")}</span>
            <span className={styles.dualLabel}>
              <div className={styles.labelgroup}>
                <label>{chrome.i18n.getMessage("shortCut")}</label>
                <label>
                  <input
                    type="text"
                    value={userSettings.translateInEditableShortCut}
                    onKeyDown={handleTranslateInEditableShortCutChange}
                  />
                </label>
                <label>{chrome.i18n.getMessage("targetLanguage")}</label>
                <label>
                  <select
                    value={userSettings.editAareTargetTransLang}
                    onChange={handleEditAreaTargetTransLangChange}
                  >
                    {languageOptions()}
                  </select>
                </label>
              </div>
            </span>
          </li>
          <li>
            <span></span>
            <span className={styles.tooltip}>
              <p>{chrome.i18n.getMessage("editableTransDesc")}</p>
              <p>{chrome.i18n.getMessage("editableTransUseTip")}</p>
            </span>
          </li>
          <li className={styles.divider}></li>
          <li>
            <span>{chrome.i18n.getMessage("advancedFeatures")}</span>
            <span>
              <label>
                <input
                  type="checkbox"
                  checked={userSettings.useProxy}
                  onChange={handleUseProxyChange}
                />
                {chrome.i18n.getMessage("settingsUseProxy")}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={userSettings.useCustomHeaders}
                  onChange={handleUseCustomHeadersChange}
                />
                {chrome.i18n.getMessage("settingsUseCustomHeaders")}
              </label>
            </span>
          </li>
          {userSettings.useProxy && (
            <li>
              <span>{chrome.i18n.getMessage("settingsProxy")}</span>
              <span>
                <input
                  type="text"
                  value={userSettings.proxyUrl}
                  onChange={handleProxyUrlChange}
                  placeholder={chrome.i18n.getMessage(
                    "settingsProxyPlaceholder"
                  )}
                />
              </span>
            </li>
          )}
          {userSettings.useCustomHeaders && (
            <li>
              <span>{chrome.i18n.getMessage("settingsCustomHeaders")}</span>
              <span>
                <CustomHeaders
                  headers={userSettings.customHeaders || {}}
                  onChange={handleCustomHeadersChange}
                />
              </span>
            </li>
          )}
          <li className={styles.divider}></li>
          <li>
            <span></span>
            <span>
              <button disabled={disableSaveButton} onClick={handleSave}>
                {chrome.i18n.getMessage("settingsSave")}
              </button>
            </span>
          </li>
        </ul>
        <div className={styles.howToUse}>
          <a
            href="#"
            onClick={() => {
              openLink(
                "https://github.com/raymondmars/chatgpt-chrome-translate-plugin"
              );
            }}
          >
            {chrome.i18n.getMessage("howToUse")}
          </a>
        </div>
        <div className={styles.contactUs}>
          <a href="#" onClick={handleContactUs}>
            {chrome.i18n.getMessage("contactUs")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Settings;
