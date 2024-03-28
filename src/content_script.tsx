import React from 'react';
import { Root, createRoot } from 'react-dom/client';

import './content_script.global.scss';
import CustomMenu from './content_components/custom_menu';
import Translate from './content_components/translate';
import { TranslateStore } from './service/store';
import { TranslateMessageType, TranslatorType, createTranslator } from './service/translator';

class WebTranslateProcessor {
    private menuContainer: HTMLElement;
    private menuRoot: Root;
    private menuItemClassName = "__translator_menu_item__";
    private translateContainerClassName = "__translator_translate_container__";
    private selectedWordsMarkerClassName = "__selected_words_marker";
    private markerTagName = "mark";
    private currentSelection: string = "";
    private currentSelectedLastElement: HTMLElement | null = null;
    // private needToOutputRootElement: HTMLElement | null = null;

    constructor() {
      const menuContainerId = "__translator_menu_container";
      if(!document.getElementById(menuContainerId)) {
        this.menuContainer = document.createElement("div");
        this.menuContainer.id = menuContainerId;
        document.body.appendChild(this.menuContainer);
      } else {
        this.menuContainer = document.getElementById(menuContainerId) as HTMLElement;
      }
      this.menuRoot = createRoot(this.menuContainer)
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

          if(settings.showMenu) {
            this.showMenu(target, selection?.toString().trim(), event.pageX, event.pageY)
          }

          this.currentSelection = selection?.toString().trim();
          this.currentSelectedLastElement = target;

        } else {
          settings.showMenu && this.hideMenu()
        }
      });

      document.addEventListener('selectionchange', () => {
        const selection = document.getSelection();

        if (!selection || selection.isCollapsed) {
          if(this.currentSelection && this.currentSelectedLastElement) {
            this.currentSelection = "";
            this.currentSelectedLastElement = null;
            // this.needToOutputRootElement = null;
          }
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
        event.preventDefault();
        
        if (event.key === 'Escape') {
          settings.showMenu && this.hideMenu()
          return false;
        }

        if (this.currentSelection && this.currentSelectedLastElement) {
          if (event.key === 't') {
            if (event.ctrlKey) {
              this.translateInSelection(this.currentSelectedLastElement, this.currentSelection);
            } else {
              this.processTranslate(this.currentSelectedLastElement, this.currentSelection);
            }
            return;
          }
      
          if (event.ctrlKey && event.key === 'm') {
            this.markAsYellow();
            return;
          }
      
          if (event.ctrlKey && event.key === 'u') {
            this.removeMarkerFromSelection();
            return;
          }
      
          if (keyToMarkerMethod[event.key]) {
            keyToMarkerMethod[event.key]();
            return;
          }
        }
      });
    }


    private showMenu(source: HTMLElement, selectedText: string, x: number, y: number) {
      const menuItems = [
        {
          label: chrome.i18n.getMessage("menuTranslate") + " (T)",
          onClick: (e: MouseEvent | React.MouseEvent<HTMLLIElement>) => {
            e.preventDefault();
            e.stopPropagation();
            this.hideMenu();
            this.processTranslate(source,selectedText);
          }
        },
        {
          label: chrome.i18n.getMessage("menuTranslateInSelection") + " (Ctrl + T)",
          onClick: (e: MouseEvent | React.MouseEvent<HTMLLIElement>) => {
            e.preventDefault();
            e.stopPropagation();
            this.hideMenu();
            this.translateInSelection(source, selectedText);
          }
        },
      ];
      this.menuRoot.render(<CustomMenu active={true} menuItems={menuItems} x={x} y={y} identityClassName={this.menuItemClassName} />);
    }

    private hideMenu() {
      this.menuRoot.render(<CustomMenu active={false} identityClassName={this.menuItemClassName} />);
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

    private async translateInSelection(source: HTMLElement, text: string) {
      const selection = document.getSelection();
      if(selection) {
        const range = selection?.getRangeAt(0);
        range?.deleteContents();
        selection.removeAllRanges();
      }

      source.innerText = chrome.i18n.getMessage("translateLoading");

      const settings = await TranslateStore.getUserSettings();
      const type = settings.translatorType || TranslatorType.ChatGPT;
      const translator = createTranslator(type);

      translator.translate(text, (result, type) => {
        switch(type) {
          case TranslateMessageType.Error:
            source.style.color = "red";
            source.style.fontWeight = "bold";
            source.style.padding = "10px";
            source.style.border = "1px solid grey";
            source.innerText = result;
            break;
          case TranslateMessageType.Message:
            source.innerText = result;
            break;
          case TranslateMessageType.End:
            break;
        }
      });
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

