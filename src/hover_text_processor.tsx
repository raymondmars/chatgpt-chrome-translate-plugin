import React from 'react';
import BaseProcessor from "./base_processor";
import { UserSettings } from "./service/store";
import PopupTip from "./content_components/popup_tip";

export default class HoverTextProcessor extends BaseProcessor {
  private isEnabled: boolean = false;
  private debounceTimeout: number | null = null;
  private debounceDelay: number;

  private hoverElementClassName = "__translator_hovered_element__";

  constructor(settings: UserSettings) {
    super(settings);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.debouncedHandleHover = this.debouncedHandleHover.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.debounceDelay = 300;
  }

  run() {
    this.initPoptipRoot();
    document.addEventListener('keydown', this.onKeyDown, { capture: true });
  }

  enable(showTip: boolean = true) {
    if (!this.isEnabled) {
      document.addEventListener('mousemove', this.onMouseMove);
      this.isEnabled = true;

      showTip && this.showPoptip("ON");
    }
  }

  disable(showTip: boolean = true) {
    if (this.isEnabled) {
      document.removeEventListener('mousemove', this.onMouseMove);
      this.isEnabled = false;
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }

      this.clearAllHoveredStyle();
      showTip && this.showPoptip("OFF");
    }
  }

  protected override onKeyDown(event: KeyboardEvent): void {
    let key = this.getShortKeys(event);

    if(this.isEnabled) {
      if(key === this.settings.hoverOnOffShortCut) {
        this.disable();
        return;
      }
      const translateShortCut = this.getShortCutKeyInSettings();
      if (this.selectedText !== '' && translateShortCut === key) {
        event.preventDefault();
        this.processTranslate();
      }
    } else {
      if(key === this.settings.hoverOnOffShortCut) {
        this.enable();
      }
    }
  }

  private onMouseMove(event: MouseEvent) {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    this.debounceTimeout = window.setTimeout(() => {
      this.debouncedHandleHover(event);
    }, this.debounceDelay);
  }

  private debouncedHandleHover(event: MouseEvent) {
    const hoverElement = document.elementFromPoint(event.clientX, event.clientY);
    if(this.elementInTransalteContainer(hoverElement)) {
      return;
    }
    this.selectedElement = hoverElement;

    if (this.selectedElement) {
      this.selectedText = this.getElementText(this.selectedElement).trim();
      if (this.selectedText !== '') {
        this.selectedElement.classList.add(this.hoverElementClassName);
        this.selectedElement.addEventListener('mouseout', () => {
          this.selectedElement?.classList.remove(this.hoverElementClassName);
        });
      }
    } else {
      this.selectedText = '';
      this.selectedElement = null;
    }
  }

  private getElementText(element: Element): string {
    return element.textContent?.trim() || '';
  }

  private showPoptip(text: string) {
    this.poptipRoot?.render(<PopupTip active={true} text={text}/>);
    setTimeout(() => {
      this.poptipRoot?.render(<PopupTip active={false} />);
    }, 1000);
  }

  private clearAllHoveredStyle() {
    const hoveredElements = document.getElementsByClassName(this.hoverElementClassName);
    for (let i = 0; i < hoveredElements.length; i++) {
      hoveredElements[i].classList.remove(this.hoverElementClassName);
    }
  }
}
