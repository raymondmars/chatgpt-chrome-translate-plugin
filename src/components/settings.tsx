import React, { useEffect } from "react";

import styles from "./settings.scss";
import { TranslateStore, UserSettings } from "../service/store";
import { TargetLanguage, TranslatorType } from "../service/translator";

import CustomHeaders from "./custom_headers";
import { DEFAULT_EDITABLE_SHORT_CUT, DEFAULT_GENERAL_SHORT_CUT } from "../service/utils";

const MakerShortCuts = ['1', '2', '3', '4', '5', '6', '0']


const Settings = () => {
  const [disableSaveButton, setDisableSaveButton] = React.useState<boolean>(true);
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
  });

  useEffect(() => {
    const funcGetUserSettings = async () => {
      const settings = await TranslateStore.getUserSettings();
      // console.log('ok...', settings)
      setUserSettings(settings);
    }
    funcGetUserSettings();

  },[]);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSettings({
      ...userSettings,
      apiKey: e.target.value
    });
  }

  const handleUseProxyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSettings({
      ...userSettings,
      useProxy: e.target.checked
    });
    setDisableSaveButton(false);
  }

  const saveShortCut = (e: React.KeyboardEvent<HTMLInputElement>, key: string, keyName: string) => {
    if (!/^[A-Z,0-9]$/.test(key)) {
      return;
    }

    if (e.ctrlKey) key = 'Ctrl + ' + key;
    if (e.shiftKey) key = 'Shift + ' + key;
    if (e.metaKey) key = 'Cmd + ' + key;
  
    if (MakerShortCuts.includes(key)) {
      return;
    }
  
    setUserSettings({
      ...userSettings,
      [keyName]: key
    });
  
    setDisableSaveButton(false);
  }

  const handleTranslateShortCutChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    let key = e.key.toUpperCase();
    if(key === userSettings.translateInEditableShortCut) {
      return;
    }

    saveShortCut(e, key, 'translateShortCut');
  }

  const handleTranslateInEditableShortCutChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    let key = e.key.toUpperCase();
    if(key === userSettings.translateShortCut) {
      return;
    }

    saveShortCut(e, key, 'translateInEditableShortCut');
  }

  const handleUseCustomHeadersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSettings({
      ...userSettings,
      useCustomHeaders: e.target.checked
    });
    setDisableSaveButton(false);
  }

  const handleProxyUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSettings({
      ...userSettings,
      proxyUrl: e.target.value
    });
    setDisableSaveButton(false);
  }

  const handleTranslatorTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserSettings({
      ...userSettings,
      translatorType: e.target.value as TranslatorType
    });
    setDisableSaveButton(false);
  }

  const handleLLMModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserSettings({
      ...userSettings,
      llmMode: e.target.value 
    });
    setDisableSaveButton(false);
  }

  const handleCustomHeadersChange = (headers: Record<string,string>) => {
    setUserSettings({
      ...userSettings,
      customHeaders: headers
    });
    setDisableSaveButton(false);
  }

  const handleTargetTransLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserSettings({
      ...userSettings,
      targetTransLang: e.target.value as TargetLanguage
    });
    setDisableSaveButton(false);
  }

  const handleEditAreaTargetTransLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserSettings({
      ...userSettings,
      editAareTargetTransLang: e.target.value as TargetLanguage
    });
    setDisableSaveButton(false);
  }

  const checkApiKey = () => {
    setDisableSaveButton(userSettings.apiKey === "");
  }

  const handlehowToUseAddress = () => {
    chrome.tabs.create({ url: "https://github.com/raymondmars/chatgpt-chrome-translate-plugin"});
  }

  const handleContactUs = () => {
    chrome.tabs.create({ url: "mailto:i@raymondjiang.net"});
  }

  const handleSave = () => {
    TranslateStore.setUserSettings(userSettings);
    setDisableSaveButton(true);
    window.setTimeout(() => window.close(), 300);
  }

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
      </>
    )
  }

  return (
    <div className={styles.settings}>
      <div className={styles.title}>Translation Bot - {chrome.i18n.getMessage("settingsTitle")}</div>
      <div className={styles.content}>
        <ul>
          <li>
            <span>{chrome.i18n.getMessage("settingsTranslator")}</span>
            <span className={styles.models}>
              <select value={userSettings.translatorType} onChange={handleTranslatorTypeChange}>
                <option value="ChatGPT">ChatGPT</option>
              </select>
              <select value={userSettings.llmMode} onChange={handleLLMModeChange}>
                <option value="gpt-4o-mini">gpt-4o-mini (cheapest)</option>
                <option value="gpt-3.5-turbo-0125">gpt-3.5-turbo-0125</option>
                <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4-turbo">gpt-4-turbo</option>
                <option value="gpt-4">gpt-4</option>
              </select>
            </span>
          </li>
          <li>
            <span>{chrome.i18n.getMessage("settingsAPIKey")}</span>
            <span>
              <input type="password"
                value={userSettings.apiKey}
                placeholder={chrome.i18n.getMessage("settingsAPIKeyPlaceholder")}
                onChange={handleApiKeyChange}
                onBlur={checkApiKey} />
            </span>
          </li>
          <li className={styles.divider}></li>
          <li>
            <span>{chrome.i18n.getMessage("generalTranslation")}</span>
            <span className={styles.dualLabel}>
              <div className={styles.labelgroup}>
                <label>{chrome.i18n.getMessage("shortCut")}</label>
                <label>
                  <input type="text"
                    value={userSettings.translateShortCut}
                    onKeyDown={handleTranslateShortCutChange} />
                </label>
                <label>{chrome.i18n.getMessage("targetLanguage")}</label>
                <label>
                  <select value={userSettings.targetTransLang} onChange={handleTargetTransLangChange}>
                    {languageOptions()}
                  </select>
                </label>
              </div>
            </span>
          </li>
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
                  <input type="text"
                    value={userSettings.translateInEditableShortCut}
                    onKeyDown={handleTranslateInEditableShortCutChange} />
                </label>
                <label>{chrome.i18n.getMessage("targetLanguage")}</label>
                <label>
                  <select value={userSettings.editAareTargetTransLang} onChange={handleEditAreaTargetTransLangChange}>
                    {languageOptions()}
                  </select>
                </label>
              </div>
            </span>
          </li>
          <li>
            <span></span>
            <span className={styles.tooltip}>
              <p>
              {chrome.i18n.getMessage("editableTransDesc")}
              </p>
              <p>
              {chrome.i18n.getMessage("editableTransUseTip")}
              </p>
            </span>
          </li>
          <li className={styles.divider}></li>
          <li>
            <span>{chrome.i18n.getMessage("advancedFeatures")}</span>
            <span>
              <label>
                <input type="checkbox"
                  checked={userSettings.useProxy}
                  onChange={handleUseProxyChange} />{chrome.i18n.getMessage("settingsUseProxy")}
              </label>
              <label>
                <input type="checkbox"
                  checked={userSettings.useCustomHeaders}
                  onChange={handleUseCustomHeadersChange} />{chrome.i18n.getMessage("settingsUseCustomHeaders")}
              </label>
            </span>
          </li>
          {
            userSettings.useProxy && <li>
              <span>{chrome.i18n.getMessage("settingsProxy")}</span>
              <span>
                <input type="text"
                  value={userSettings.proxyUrl}
                  onChange={handleProxyUrlChange}
                  placeholder={chrome.i18n.getMessage("settingsProxyPlaceholder")} />
              </span>
            </li>
          }
          {
            userSettings.useCustomHeaders && <li>
              <span>{chrome.i18n.getMessage("settingsCustomHeaders")}</span>
              <span>
                <CustomHeaders headers={userSettings.customHeaders || {}} onChange={handleCustomHeadersChange}/>
              </span>
            </li>
          }
          <li className={styles.divider}></li>
          <li>
            <span></span>
            <span>
              <button disabled={disableSaveButton} onClick={handleSave}>{chrome.i18n.getMessage("settingsSave")}</button>
            </span>
          </li>
        </ul>
        <div className={styles.howToUse}>
          <a href="#" onClick={handlehowToUseAddress}>{chrome.i18n.getMessage("howToUse")}</a>
        </div>
        <div className={styles.contactUs}>
          <a href="#" onClick={handleContactUs}>{chrome.i18n.getMessage("contactUs")}</a>
        </div>
      </div>
    </div>
  )
}

export default Settings;
