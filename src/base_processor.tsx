import React from 'react';
import { Root, createRoot } from 'react-dom/client';

import { UserSettings } from "./service/store";
import Translate from './content_components/translate';
import { DEFAULT_GENERAL_SHORT_CUT } from './service/utils';

const BLOCK_SELECTOR = 'p,li,div,section,article,blockquote,pre,td,th,h1,h2,h3,h4,h5,h6';
const DISALLOWED_REPLACE_SELECTOR = 'a,button,code,pre,input,textarea,select';

export default abstract class BaseProcessor {
  private static anchorSeed = 0;
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
    if (this.selectedText === '' || !this.selectedElement) {
      return;
    }

    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    const anchorElement = this.getAnchorElement(range) || this.selectedElement;
    const anchorId = this.ensureAnchorId(anchorElement);

    this.removeExistingContainer(anchorId);
    const startBlock = anchorElement?.closest(BLOCK_SELECTOR) || anchorElement;
    const endBlock = this.getEndBlock(range);

    const crossesBlocks = !!(startBlock && endBlock && startBlock !== endBlock);
    const inDisallowedContext = !!anchorElement?.closest(DISALLOWED_REPLACE_SELECTOR);

    const inlineContext = this.isInlineContext(anchorElement);
    const container = document.createElement(inlineContext ? 'span' : 'div');
    container.className = this.translateContainerClassName;
    container.dataset.anchorId = anchorId;
    createRoot(container).render(<Translate inputText={this.selectedText} />);

    const displayMode = this.settings.translationDisplayMode || "append";
    const canReplace = displayMode === "replace" && range && !crossesBlocks && !inDisallowedContext;

    if (canReplace && range) {
      try {
        range.deleteContents();
        range.insertNode(container);
      } catch {
        this.appendContainer(container, startBlock, anchorElement, range, inlineContext);
      }
    } else {
      this.appendContainer(container, startBlock, anchorElement, range, inlineContext);
    }

    selection?.removeAllRanges();
    this.selectedText = '';
    this.selectedElement = null;
  }

  private removeExistingContainer(anchorId: string) {
    const selector = `.${this.translateContainerClassName}[data-anchor-id=\"${anchorId}\"]`;
    const existing = document.querySelector<HTMLElement>(selector);
    existing?.remove();
  }

  private ensureAnchorId(element: Element | null): string {
    if (!element) {
      return 'global';
    }
    const existing = element.getAttribute('data-translator-anchor-id');
    if (existing) {
      return existing;
    }
    const id = `anchor-${BaseProcessor.anchorSeed++}`;
    element.setAttribute('data-translator-anchor-id', id);
    return id;
  }

  private getAnchorElement(range: Range | null): Element | null {
    if (!range) {
      return null;
    }

    const common = range.commonAncestorContainer;
    if (common.nodeType === Node.ELEMENT_NODE) {
      return common as Element;
    }
    return common.parentElement;
  }

  private getEndBlock(range: Range | null): Element | null {
    if (!range) {
      return null;
    }
    const endContainer = range.endContainer;
    const endElement = endContainer.nodeType === Node.ELEMENT_NODE
      ? endContainer as Element
      : endContainer.parentElement;
    return endElement?.closest(BLOCK_SELECTOR) || endElement || null;
  }

  private isInlineContext(element: Element | null): boolean {
    if (!element) {
      return false;
    }
    try {
      const display = window.getComputedStyle(element).display;
      return display === 'inline' || display === 'inline-block' || display === 'inline-flex';
    } catch {
      return false;
    }
  }

  private appendContainer(
    container: HTMLElement,
    blockAncestor: Element | null,
    anchor: Element | null,
    range: Range | null,
    inlineContext: boolean
  ) {
    if (range) {
      const collapsed = range.cloneRange();
      collapsed.collapse(false);
      try {
        collapsed.insertNode(container);
        return;
      } catch {
        // fall through to structural insert
      }
    }

    if (!inlineContext && blockAncestor && blockAncestor.parentNode) {
      blockAncestor.parentNode.insertBefore(container, blockAncestor.nextSibling);
      return;
    }

    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(container, anchor.nextSibling);
      return;
    }

    if (this.selectedElement) {
      this.selectedElement.appendChild(container);
      return;
    }

    document.body.appendChild(container);
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
