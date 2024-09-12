import BaseProcessor from "./base_processor";
import { UserSettings } from "./service/store";


export default class MouseSelectProcessor extends BaseProcessor {
  private isEnabled: boolean = false;


  constructor(settings: UserSettings) {
    super(settings);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  enable() {
    if (!this.isEnabled) {
      document.addEventListener('mouseup', this.onMouseUp);
      document.addEventListener('keydown', this.onKeyDown, { capture: true });
      this.isEnabled = true;
    }
  }

  disable() {
    if (this.isEnabled) {
      document.removeEventListener('mouseup', this.onMouseUp);
      document.removeEventListener('keydown', this.onKeyDown);
      this.isEnabled = false;
    }
  }

  private onMouseUp(event: MouseEvent) {
    const selection = document.getSelection();
    const target = event.target as HTMLElement;

    if (selection && selection?.toString().trim().length > 0 && !selection.isCollapsed) {
      this.selectedText = selection?.toString().trim();
      this.selectedElement = target;
    } else {
      this.selectedText = '';
      this.selectedElement = null;
    }
  }
}
