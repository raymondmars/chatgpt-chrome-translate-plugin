

// const sites = ['amazon', '1688', 'taobao'];

// const isSite = (url: string) => {
//   return sites.some((site) => url.includes(site));
// }

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // if (changeInfo.status == 'complete' && tab.active && tab.url && isSite(tab.url)) {
  //   // chrome.tabs.executeScript({
  //   //   file: 'contentScript.js',
  //   // });
  // }
});
