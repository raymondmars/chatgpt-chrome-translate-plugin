import React from 'react';
import { Root, createRoot } from 'react-dom/client';

import './content_script.global.scss';
import CustomMenu from './content_components/custom_menu';
import Translate from './content_components/translate';
import { TranslateStore } from './service/store';
import { TranslateMessageType, TranslatorType, createTranslator } from './service/translator';
import TextAreaProcessor from './service/textarea_processor';
import { DEFAULT_EDITABLE_SHORT_CUT, DEFAULT_GENERAL_SHORT_CUT } from './service/utils';

class WebTranslateProcessor {
    private menuContainer: HTMLElement;
    private menuItemClassName = "__translator_menu_item__";
    private translateContainerClassName = "__translator_translate_container__";
    private selectedWordsMarkerClassName = "__selected_words_marker";
    private markerTagName = "mark";
    private currentSelection: string = "";
    private currentSelectedLastElement: HTMLElement | null = null;


    constructor() {
      const menuContainerId = "__translator_menu_container";
      if(!document.getElementById(menuContainerId)) {
        this.menuContainer = document.createElement("div");
        this.menuContainer.id = menuContainerId;
        document.body.appendChild(this.menuContainer);
      } else {
        this.menuContainer = document.getElementById(menuContainerId) as HTMLElement;
      }
    }

    public async run() {
      const settings = await TranslateStore.getUserSettings();

      document.addEventListener('mouseup', (event: MouseEvent) => {
        const selection = document.getSelection();
        const target = event.target as HTMLElement;

        if(target.classList.contains(this.menuItemClassName)) {
          return;
        }

        if (selection && selection?.toString().trim().length > 0 && !selection.isCollapsed) {
          this.currentSelection = selection?.toString().trim();
          this.currentSelectedLastElement = target;
        }
      });

      document.addEventListener('selectionchange', () => {
        const selection = document.getSelection();

        if (!selection || selection.isCollapsed) {
          if(this.currentSelection && this.currentSelectedLastElement) {
            this.currentSelection = "";
            this.currentSelectedLastElement = null;
          }
        }

        if(selection) {
          this.currentSelection = selection.toString().trim();
        }
      });

      // Define a mapping from keys to marker methods
      const keyToMarkerMethod: { [key: string]: Function } = {
        '1': () => { this.markAsYellow() },
        '2': () => { this.markAsCyanBlue() },
        '3': () => { this.markAsOrgange() },
        '4': () => { this.markAsPink() },
        '5': () => { this.markAsBottomDotted() },
        '6': () => { this.markAsShadowEffect() },
        '0': () => { this.removeMarkerFromSelection() }
      };

      document.addEventListener('keydown', (event: KeyboardEvent) => {

        let key = event.key.toUpperCase();

        if (event.ctrlKey) key = 'Ctrl + ' + key;
        if (event.shiftKey) key = 'Shift + ' + key;
        if (event.metaKey) key = 'Cmd + ' + key;

        const translateInEditableShortCut = settings.translateInEditableShortCut || DEFAULT_EDITABLE_SHORT_CUT;
        if(translateInEditableShortCut === key && this.currentSelection !== '') {
          this.processTranslateInCommentOrPost(this.currentSelection);
          return;
        }

        if (this.currentSelection && this.currentSelectedLastElement) {
          const translateShortCut = settings.translateShortCut || DEFAULT_GENERAL_SHORT_CUT;
          if (translateShortCut === key) {
            this.processTranslate(this.currentSelectedLastElement, this.currentSelection);
            return;
          }
      
          if (keyToMarkerMethod[event.key]) {
            keyToMarkerMethod[event.key]();
            return false;
          }
        }
      }, true);
    }

    private processTranslate(source: HTMLElement, text: string) {
      if(source.getElementsByClassName(this.translateContainerClassName).length > 0) {
        source.getElementsByClassName(this.translateContainerClassName)[0].remove();
      }

      const div = document.createElement("div");
      div.className = this.translateContainerClassName;
      createRoot(div).render(<Translate inputText={text} />);
      source.appendChild(div);
    }

    private processTranslateInCommentOrPost(text: string) {
      console.log('text:', text);
      const textareaProcessor = new TextAreaProcessor(text);
      textareaProcessor.processTranslating();
    }

    private addMarkerToSelection(markerClassName: string) {
      const selection = document.getSelection();
      if(selection && selection.rangeCount > 0) {
        const existedMarker = this.findMarkerInSelection(selection);
        if(existedMarker && !existedMarker.classList.contains(markerClassName)) {
          existedMarker.classList.add(markerClassName);
          return;
        }

        const range = selection.getRangeAt(0);
        const marker = document.createElement(this.markerTagName);
        marker.className = markerClassName;
        marker.innerText = selection.toString();
        range.surroundContents(marker);
        selection.removeAllRanges();
      }
    }

    private removeMarkerFromSelection() {
      const selection = document.getSelection();
      if(selection && selection.rangeCount > 0) {
        const existedMarker = this.findMarkerInSelection(selection);
        if(existedMarker) {
          const parent = existedMarker.parentElement;
          parent?.replaceChild(existedMarker.firstChild as Node, existedMarker);
        }
      }
    }

    private findMarkerInSelection(selection: Selection): HTMLElement | null {
      const range = selection.getRangeAt(0);
      const markerText = range.commonAncestorContainer as HTMLElement;
      const marker = markerText.parentElement;
      if(marker?.tagName.toLowerCase() === this.markerTagName &&
      marker?.className.indexOf(this.selectedWordsMarkerClassName) >= 0) {
        return marker;
      }
      return null;
    }

    private markAsYellow() {
      this.addMarkerToSelection('__selected_words_marker_1__');
    }

    private markAsCyanBlue() {
      this.addMarkerToSelection('__selected_words_marker_2__');
    }

    private markAsOrgange() {
      this.addMarkerToSelection('__selected_words_marker_3__');
    }

    private markAsPink() {
      this.addMarkerToSelection('__selected_words_marker_4__');
    }

    private markAsBottomDotted() {
      this.addMarkerToSelection('__selected_words_marker_5__');
    }

    private markAsShadowEffect() {
      this.addMarkerToSelection('__selected_words_marker_6__');
    }
}

(new WebTranslateProcessor()).run();

