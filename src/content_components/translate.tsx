import React, { useEffect } from "react";
import styles from "./translate.scss";
import {
  OutputFormat,
  TargetLanguage,
  TranslateMessageType,
  TranslatorType,
  createTranslator,
} from "../service/translator";
import { TranslateStore } from "../service/store";

const Translate = (props: { inputText: string }) => {
  const [show, setShow] = React.useState<boolean>(true);
  const [resultContent, setResultContent] = React.useState<string>("");
  const [showEnd, setShowEnd] = React.useState<boolean>(false);
  const [showError, setShowError] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [isRTL, setIsRTL] = React.useState<boolean>(false);

  const handleClickClose = (
    e: MouseEvent | React.MouseEvent<HTMLSpanElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setShow(false);
  };

  useEffect(() => {
    const funcTranslate = async () => {
      setShowError(false);
      setShowEnd(false);
      setLoading(true);
      setResultContent('');

      const settings = await TranslateStore.getUserSettings();
      const type = settings.translatorType || TranslatorType.ChatGPT;
      const targetLang = settings.targetTransLang || TargetLanguage.English;
      const translator = createTranslator(type);
      const targetLang = settings.targetTransLang || TargetLanguage.English;

      // Check if the target language is RTL
      const rtlLanguages = [TargetLanguage.Arabic, TargetLanguage.Persian];
      setIsRTL(rtlLanguages.includes(targetLang));

      translator.translate(
        props.inputText,
        targetLang,
        OutputFormat.HTML,
        (message, type) => {
          if (loading) {
            setLoading(false);
          }
          switch (type) {
            case TranslateMessageType.Error:
              setShowError(true);
              setResultContent(message);
              break;
            case TranslateMessageType.Message:
              setShowError(false);
              setResultContent(message);
              break;
            case TranslateMessageType.End:
              setShowError(false);
              setShowEnd(true);
              break;
          }
        }
      );
    };
    funcTranslate();
  }, [props.inputText]);

  return (
    <>
      {show && (
        <div className={styles.translate}>
          <div className={showError ? styles.error : styles.result}>
            {loading && (
              <div className={styles.loading}>
                &#9998; {chrome.i18n.getMessage("translateLoading")}
              </div>
            )}
            <div
              dir={isRTL ? "rtl" : "ltr"}
              dangerouslySetInnerHTML={{ __html: resultContent }}
            ></div>
            {showEnd && (
              <>
                <span className={styles.close} onClick={handleClickClose}>
                  &#x2715;
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Translate;
