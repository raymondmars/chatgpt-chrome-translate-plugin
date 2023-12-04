/**
 * 菜单动作
 */
export enum MenuAction {
  Translate = 1,
  SummaryAndTranslate = 2,
  IELTSReading = 3,
}

export const getActionLoadingText = (action: MenuAction): string => {
  switch (action) {
    case MenuAction.Translate:
      return chrome.i18n.getMessage('translateLoading');
    case MenuAction.SummaryAndTranslate:
      return chrome.i18n.getMessage('summarizeLoading');
    case MenuAction.IELTSReading:
      return chrome.i18n.getMessage('ieltsReadLoading');
    default:
      throw new Error('Invalid menu action');
  }
}
