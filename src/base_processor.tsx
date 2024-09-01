import React from 'react';
import { Root, createRoot } from 'react-dom/client';


import { UserSettings } from "./service/store";
import Translate from './content_components/translate';
import { DEFAULT_GENERAL_SHORT_CUT } from './service/utils';

export default abstract class BaseProcessor {
  protected translateContainerClassName = "__translator_translate_container__";
  protected poptipContainerId = "__translator_poptip_container__";

  protected selectedText: string = "";
  protected selectedElement: Element | null = null;
  protected settings: UserSettings;

  private poptipContainer: HTMLElement | null = null;
  protected poptipRoot: Root | null = null;

  constructor(settings: UserSettings) {
    this.settings = settings;
  }

  protected onKeyDown(event: KeyboardEvent) {
    let key = this.getShortKeys(event);

    const translateShortCut = this.getShortCutKeyInSettings();

    if (this.selectedText !== '' && translateShortCut === key) {
      event.preventDefault();
      this.processTranslate();
    }
  }

  protected getShortKeys(event: KeyboardEvent) {
    let key = event.key.toUpperCase();

    if (event.ctrlKey) key = 'Ctrl + ' + key;
    if (event.shiftKey) key = 'Shift + ' + key;
    if (event.metaKey) key = 'Cmd + ' + key;

    return key;
  }

  protected elementInTransalteContainer(element: Element | null): boolean {
    if(!element) {
      return false;
    }
    const elementIsRoot = element.classList.contains(this.translateContainerClassName);
    const elementIsChild = element.closest(`.${this.translateContainerClassName}`);

    return elementIsRoot || elementIsChild !== null;
  }

  protected getShortCutKeyInSettings(): string {
    return this.settings.translateShortCut || DEFAULT_GENERAL_SHORT_CUT;
  }

  protected processTranslate() {
    if(this.selectedText === '' || !this.selectedElement) {
      return;
    }

    if(this.selectedElement.getElementsByClassName(this.translateContainerClassName).length > 0) {
      this.selectedElement.getElementsByClassName(this.translateContainerClassName)[0].remove();
    }

    const div = document.createElement("div");
    div.className = this.translateContainerClassName;
    createRoot(div).render(<Translate inputText={this.selectedText} />);
    this.selectedElement.appendChild(div);
  }

  protected initPoptipRoot() {
    if(!document.getElementById(this.poptipContainerId)) {
      this.poptipContainer = document.createElement("div");
      this.poptipContainer.id = this.poptipContainerId;
      document.body.appendChild(this.poptipContainer);
    } else {
      this.poptipContainer = document.getElementById(this.poptipContainerId) as HTMLElement;
    }
    this.poptipRoot = createRoot(this.poptipContainer)
  }
}
