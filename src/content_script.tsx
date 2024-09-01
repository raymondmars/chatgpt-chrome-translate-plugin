import './content_script.global.scss';
import { TextSelectionMethod, TranslateStore } from './service/store';
import HoverTextProcessor from './hover_text_processor';
import MouseSelectProcessor from './mouse_select_processor';
import EditableAreaProcessor from './editable_area_processor';

class WebTranslateProcessor {
    constructor() {
    }

    public async run() {
      const settings = await TranslateStore.getUserSettings();

      switch(settings.selectionMethod) {
        case TextSelectionMethod.MouseSelection:
          new MouseSelectProcessor(settings).enable();
          break;
        case TextSelectionMethod.HoverOverText:
          new HoverTextProcessor(settings).run();
          break;
        default:
          new MouseSelectProcessor(settings).enable();
          break;
      }

      new EditableAreaProcessor(settings).enable();
    }
}

(new WebTranslateProcessor()).run();

