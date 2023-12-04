import React from 'react';
import { Root, createRoot } from 'react-dom/client';

import './content_script.global.scss';
import CustomMenu from './content_components/custom_menu';
import Translate from './content_components/translate';
import { MenuAction } from './service/menu_action';

class WebTranslateProcessor {
    private menuContainer: HTMLElement;
    private menuRoot: Root;
    private menuItemClassName = "__translator_menu_item__";
    private translateContainerClassName = "__translator_translate_container__";

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

    public run() {
      document.addEventListener('mouseup', (event: MouseEvent) => {
        const selection = document.getSelection();
        const target = event.target as HTMLElement;
        if(target.classList.contains(this.menuItemClassName)) {
          return;
        }

        if (selection && selection?.toString().trim().length > 0 && !selection.isCollapsed) {
          // const range = selection.getRangeAt(0);
          // const rect = range.getBoundingClientRect();
          console.log("target:", target);
          this.showMenu(target, selection?.toString().trim(), event.pageX, event.pageY)
        } else {
          // if ((selection && selection.isCollapsed) || (selection && selection?.toString().trim().length === 0)) {
            this.hideMenu()
          // }
        }
      });
    }

    private showMenu(source: HTMLElement, selectedText: string, x: number, y: number) {
      const translateItem = {
        label: chrome.i18n.getMessage("menuTranslate"),
        onClick: (e: MouseEvent | React.MouseEvent<HTMLLIElement>) => {
          e.preventDefault();
          e.stopPropagation();
          this.hideMenu();
          const translateNode = <Translate inputText={selectedText.trim()} action={MenuAction.Translate} />
          this.processTranslate(source, translateNode);
        }
      }

      // const translateWithSummarizeItem = {
      //   label: chrome.i18n.getMessage("menuTranslateWithSummarize"),
      //   onClick: (e: MouseEvent | React.MouseEvent<HTMLLIElement>) => {
      //     e.preventDefault();
      //     e.stopPropagation();
      //     this.hideMenu();
      //     const translateNode = <Translate inputText={selectedText.trim()} action={MenuAction.SummaryAndTranslate} />
      //     this.processTranslate(source, translateNode);
      //   }
      // }

      // const ieltsReadingItem = {
      //   label: chrome.i18n.getMessage("menuIeltsReadingAnalysis"),
      //   onClick: (e: MouseEvent | React.MouseEvent<HTMLLIElement>) => {
      //     e.preventDefault();
      //     e.stopPropagation();
      //     this.hideMenu();
      //     const translateNode = <Translate inputText={selectedText.trim()} action={MenuAction.IELTSReading} />
      //     this.processTranslate(source, translateNode);
      //   }
      // }

      const copyItem = {
        label: chrome.i18n.getMessage("menuCopy"),
        onClick: (e: MouseEvent | React.MouseEvent<HTMLLIElement>) => {
          e.preventDefault();
          e.stopPropagation();
          this.hideMenu();
          this.processCopy(selectedText);
        }
      }

      const menuItems = [
        translateItem
      ];

      // if(this.isEnglish(selectedText.trim())) {
      //   menuItems.push(ieltsReadingItem)
      // }

      menuItems.push(copyItem);

      this.menuRoot.render(<CustomMenu active={true} menuItems={menuItems} x={x} y={y} identityClassName={this.menuItemClassName} />);
    }

    private hideMenu() {
      this.menuRoot.render(<CustomMenu active={false} identityClassName={this.menuItemClassName} />);
    }


    private processTranslate(source: HTMLElement, renderNode: React.ReactElement) {
      if(source.getElementsByClassName(this.translateContainerClassName).length > 0) {
        source.getElementsByClassName(this.translateContainerClassName)[0].remove();
      }

      const div = document.createElement("div");
      div.className = this.translateContainerClassName;
      createRoot(div).render(renderNode);
      source.appendChild(div);
    }

    private processCopy(text: string) {
      console.log("processCopy:", text);
      // copy to clipboard
      const input = document.createElement('textarea');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('Copy');
      document.body.removeChild(input);
    }
}

(new WebTranslateProcessor()).run();
