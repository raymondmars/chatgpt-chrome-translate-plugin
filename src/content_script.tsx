import React from 'react';
import { Root, createRoot } from 'react-dom/client';

import { Translator, TranslatorType, createTranslator } from "./service/translator";

import './content_script.global.scss';
import CustomMenu from './content_components/custom_menu';
import Translate from './content_components/translate';

class WebTranslateProcessor {
    private menuContainer: HTMLElement;
    private menuRoot: Root;
    private menuItemClassName = "__translator_menu_item__";
    private translateContainerClassName = "__translator_translate_container__";

    constructor(translator: Translator) {
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
      console.log("WebTranslateProcessor.run ...");
      document.addEventListener('mouseup', (event: MouseEvent) => {
        const selection = document.getSelection();
        const target = event.target as HTMLElement;
        if(target.classList.contains(this.menuItemClassName)) {
          return;
        }

        if (selection && selection?.toString().trim().length > 0 && !selection.isCollapsed) {
          // const range = selection.getRangeAt(0);
          // const rect = range.getBoundingClientRect();
 
          this.showMenu(target, selection?.toString().trim(), event.pageX, event.pageY)
        } else {
          if (selection && selection.isCollapsed) {
            this.hideMenu()
          }
        }
      });
    }

    private showMenu(source: HTMLElement, selectedText: string, x: number, y: number) {
      const menuItems = [
        {
          label: "Translate",
          onClick: (e: MouseEvent | React.MouseEvent<HTMLLIElement>) => {
            e.preventDefault();
            e.stopPropagation();
            this.hideMenu();
            this.processTranslate(source,selectedText);
          }
        },
        {
          label: "Copy",
          onClick: (e: MouseEvent | React.MouseEvent<HTMLLIElement>) => {
            e.preventDefault();
            e.stopPropagation();
            this.hideMenu();
            this.processCopy(selectedText);
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

(new WebTranslateProcessor(createTranslator(TranslatorType.ChatGPT))).run();
