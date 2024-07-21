import { TranslateStore } from "./store";
import { createTranslator, TargetLanguage, TranslateMessageType, TranslatorType } from "./translator";

export default class TextAreaProcessor {
  private targetText: string;

  constructor(targetText: string) {
    this.targetText = targetText;
  }

  private setTextToElement(text: string) {
    document.execCommand("insertText", false, text);
  }

  private selectAllText() {
    document.execCommand("selectAll", false);
  }

  private deleteSelection() {
    document.execCommand("delete", false);
  }

  public async processTranslating() {
    if(this.targetText.trim() === '') {
      return;
    }

    const settings = await TranslateStore.getUserSettings();
    const type = settings.translatorType || TranslatorType.ChatGPT;
    const translator = createTranslator(type);

    this.setTextToElement(chrome.i18n.getMessage("translateLoading"));

    let returnText = '';
    translator.translate(this.targetText, settings.editAareTargetTransLang || TargetLanguage.English, (result, type) => {
      switch(type) {
        case TranslateMessageType.Error:
          this.setTextToElement('error:' + result)
          break;
        case TranslateMessageType.Message:
          returnText = result;
          break;
        case TranslateMessageType.End:
          console.log('end:', returnText);
          this.selectAllText();
          setTimeout(() => {
            this.deleteSelection();
            this.setTextToElement(returnText);
          }, 200);
          break;
      }
    });
  }
}
