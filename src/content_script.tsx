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
          // const range = selection.getRangeAt(0);
          // const rect = range.getBoundingClientRect();
          // console.log("target:", target);
          if(settings.showMenu) {
            this.showMenu(target, selection?.toString().trim(), event.pageX, event.pageY)
          }

          this.currentSelection = selection?.toString().trim();
          this.currentSelectedLastElement = target;

          // process output root element
          // this.needToOutputRootElement = document.createElement("div");
          // const range = selection.getRangeAt(0);
          // this.currentSelectedElements = this.getElementsInRange(range);

          // elements.forEach((element) => {
          //   this.needToOutputRootElement?.appendChild(element.cloneNode(true));
          // });

          // console.log(this.needToOutputRootElement);

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

      document.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          settings.showMenu && this.hideMenu()
          return false;
        }

        if (event.key === 't' 
            && this.currentSelection 
            && this.currentSelectedLastElement) {
          this.processTranslate(this.currentSelectedLastElement, this.currentSelection);
          const computedStyle = window.getComputedStyle(this.currentSelectedLastElement);
          console.log('color......', computedStyle.color);
          return false;
        }

        if (event.ctrlKey 
            && event.key === 't' 
            && this.currentSelection 
            && this.currentSelectedLastElement) {
          this.translateInSelection(this.currentSelectedLastElement, this.currentSelection);
          return false;
        }

        if (((event.ctrlKey && event.key === 'm') || event.key === '1') && this.currentSelection) {
          this.addMarkerToSelection('__selected_words_marker_1__');
          return false;
        }

        if (event.key === '2' && this.currentSelection) {
          this.addMarkerToSelection('__selected_words_marker_2__');
          return false;
        }

        if (event.key === '3' && this.currentSelection) {
          this.addMarkerToSelection('__selected_words_marker_3__');
          return false;
        }

        if (event.key === '4' && this.currentSelection) {
          this.addMarkerToSelection('__selected_words_marker_4__');
          return false;
        }

        if (event.key === '5' && this.currentSelection) {
          this.addMarkerToSelection('__selected_words_marker_5__');
          return false;
        }

        if (event.key === '6' && this.currentSelection) {
          this.addMarkerToSelection('__selected_words_marker_6__');
          return false;
        }

        if (((event.ctrlKey && event.key === 'u') || event.key === '0') && this.currentSelection) {
          this.removeMarkerFromSelection();
          return false;
        }

        // if(event.ctrlKey && event.key === 'd') {
        //   if(this.currentSelection && this.needToOutputRootElement) {
        //     console.log('...toPNG', this.needToOutputRootElement);
        //     toPng(this.needToOutputRootElement)
        //     .then(function (dataUrl) {
        //       if(dataUrl) {
        //         var link = document.createElement('a');
        //         link.download = 'translation-bot.png';
        //         link.href = dataUrl;
        //         link.click();
        //       } else {
        //         console.error('no dataUrl');
        //       }

        //     })
        //     .catch(function (error) {
        //       console.error('oops, something went wrong!', error);
        //     });
        //   }
        // }
      });
    }

    // private getElementsInRange(range: Range): Node[] {
    //   const elements: Node[] = [];
    //   const iterator = document.createNodeIterator(range.commonAncestorContainer, NodeFilter.SHOW_ELEMENT);
    //   let node;
    //   while ((node = iterator.nextNode())) {
    //       if (range.intersectsNode(node)) {
    //           elements.push(node);
    //       }
    //   }
    //   return elements;
    // }

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
}

(new WebTranslateProcessor()).run();

