import BaseProcessor from "./base_processor";
import { UserSettings } from "./service/store";
import TextAreaProcessor from "./service/textarea_processor";
import { DEFAULT_EDITABLE_SHORT_CUT } from "./service/utils";


export default class EditableAreaProcessor extends BaseProcessor {
  private isEnabled: boolean = false;

  constructor(settings: UserSettings) {
    super(settings);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  enable() {
    if (!this.isEnabled) {
      document.addEventListener('selectionchange', this.onSelectChange);
      document.addEventListener('keydown', this.onKeyDown, true);
      this.isEnabled = true;
    }
  }

  disable() {
    if (this.isEnabled) {
      document.removeEventListener('selectionchange', this.onSelectChange);
      document.removeEventListener('keydown', this.onKeyDown);
      this.isEnabled = false;
    }
  }

  protected override processTranslate() {
    if(this.selectedText === '') {
      return;
    }
    const textareaProcessor = new TextAreaProcessor(this.selectedText);
    textareaProcessor.processTranslating();
  }

  protected override getShortCutKeyInSettings(): string {
    return this.settings.translateInEditableShortCut || DEFAULT_EDITABLE_SHORT_CUT;
  }

  private onSelectChange(event: Event) {
    const selection = document.getSelection();

    if (!selection || selection.isCollapsed) {
      this.selectedElement = null;
      this.selectedText = "";
    }

    if(selection) {
      this.selectedText = selection.toString().trim();
    }
  }
}
