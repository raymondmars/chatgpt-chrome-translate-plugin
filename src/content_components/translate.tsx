import React, { useEffect } from 'react';
import styles from './translate.scss';
import { TranslatorType, createTranslator } from '../service/translator';

const Translate = (props: { inputText: string }) => {
  const [show, setShow] = React.useState<boolean>(true);
  const [resultContent, setResultContent] = React.useState<string>("Translating...");
  const [showEnd, setShowEnd] = React.useState<boolean>(false);

  const handleClickClose = (e: MouseEvent | React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShow(false);
  }

  useEffect(() => {
    console.log("Translate.useEffect ...", props.inputText);
    const translator = createTranslator(TranslatorType.ChatGPT);
    translator.translate(props.inputText, (result) => {
      if(translator.getEndIdentity() === result) {
        setShowEnd(true);
        return;
      }
      setResultContent(result)
    });
  }, [props.inputText]);


  return (
    <>
    { show && <div className={styles.translate}>
      <span className={styles.close} onClick={handleClickClose}>&#x2715;</span>
      <div className={styles.result}>
        {resultContent}
        { showEnd && <span className={styles.end}>&#x2714;</span>}
      </div>
    </div> }
    </>
  )
}

export default Translate;
