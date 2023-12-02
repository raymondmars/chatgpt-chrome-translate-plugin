import React, { useEffect } from 'react';
import styles from './translate.scss';
import { TranslatorType, createTranslator } from '../service/translator';
import { TranslateStore } from '../service/store';

const Translate = (props: { inputText: string }) => {
  const [show, setShow] = React.useState<boolean>(true);
  const [resultContent, setResultContent] = React.useState<string>(chrome.i18n.getMessage("translateLoading"));
  const [showEnd, setShowEnd] = React.useState<boolean>(false);

  const handleClickClose = (e: MouseEvent | React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShow(false);
  }

  useEffect(() => {
    console.log("Translate...", props.inputText);
    const funcTranslate = async () => {
      const settings = await TranslateStore.getUserSettings();
      const type = settings.translatorType || TranslatorType.ChatGPT;
      const translator = createTranslator(type);
      translator.translate(props.inputText, (result) => {
        if(translator.getEndIdentity() === result) {
          setShowEnd(true);
          return;
        }
        setResultContent(result)
      });
    }
    funcTranslate();

  }, [props.inputText]);


  return (
    <>
    { show && <div className={styles.translate}>
      <span className={styles.close} onClick={handleClickClose}>&#x2715;</span>
      <div className={styles.result}>
        {resultContent}
        { showEnd && <span className={styles.end}>&#x2752;</span>}
      </div>
    </div> }
    </>
  )
}

export default Translate;
