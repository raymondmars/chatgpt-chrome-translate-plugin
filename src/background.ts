chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});
