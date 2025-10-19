import { TranslateStore } from "./store";
import { createTranslator, OutputFormat, TargetLanguage, TranslateMessageType, TranslatorType } from "./translator";
import { TranslationCache } from "./translation_cache";

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
    const targetLang = settings.editAareTargetTransLang || TargetLanguage.English;

    const textHash = await TranslationCache.generateHash(this.targetText);
    const cached = await TranslationCache.get(textHash, targetLang, OutputFormat.PlainText, type);
    if (cached) {
      this.selectAllText();
      setTimeout(() => {
        this.deleteSelection();
        this.setTextToElement(cached);
      }, 10);
      return;
    }

    const translator = createTranslator(type);

    this.setTextToElement(chrome.i18n.getMessage("translateLoading"));

    let returnText = '';
    translator.translate(this.targetText, targetLang, OutputFormat.PlainText, (result, type) => {
      switch(type) {
        case TranslateMessageType.Error:
          this.setTextToElement('error:' + result)
          break;
        case TranslateMessageType.Message:
          returnText = result;
          break;
        case TranslateMessageType.End:
          // console.log('end:', returnText);
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
