import React, { ReactNode, useEffect } from 'react';
import styles from './translate.scss';
import { LLMType, createLLM } from '../service/llm';
import { LLMStore } from '../service/store';
import { MenuAction, getActionLoadingText } from '../service/menu_action';

const Translate = (props: { inputText: string, action: MenuAction, endFlag?: ReactNode }) => {
  const loadingText = getActionLoadingText(props.action)

  const [show, setShow] = React.useState<boolean>(true);
  const [resultContent, setResultContent] = React.useState<string>(loadingText);
  const [showEnd, setShowEnd] = React.useState<boolean>(false);

  const handleClickClose = (e: MouseEvent | React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShow(false);
  }

  useEffect(() => {
    console.log("input text: ", props.inputText);
    const startProcess = async () => {
      const settings = await LLMStore.getUserSettings();
      const type = settings.llmType || LLMType.ChatGPT;
      const llm = createLLM(type);
      let processFunc: (text: string, callback: (result: string) => void) => void ;

      switch(props.action) {
        case MenuAction.Translate:
          processFunc = llm.translate;
          break;
        case MenuAction.SummaryAndTranslate:
          processFunc = llm.summary;
          break;
        case MenuAction.IELTSReading:
          processFunc = llm.ieltsReading;
          break;
        default:
          processFunc = llm.translate;
          break;
      }

      processFunc.bind(llm)(props.inputText, (result) => {
        if(llm.getEndIdentity() === result) {
          setShowEnd(true);
          return;
        }
        setResultContent(result)
      });
    }
    startProcess();

  }, [props.inputText]);


  return (
    <>
    { show && <div className={styles.translate}>
      <span className={styles.close} onClick={handleClickClose}>&#x2715;</span>
      <div className={styles.result}>
        {resultContent}
        { showEnd && <span className={styles.end}>{props.endFlag ?? (<label>&#x2752;</label>)}</span>}
      </div>
    </div> }
    </>
  )
}

export default Translate;
