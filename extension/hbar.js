/**
 * Find the item on HN using the search api for this page.
 * @return {Bool} True or false if there is an item for this page.
 */
var findItemForPage = function () {
    var items = JSON.parse(response);
};

var hbarForPage = function (url, tabId) {
    if (findItemForPage(url)) {
        // Show the page action
        chrome.pageAction.show(tabId);
    } else {
        // ...
    } };

// Event handlers
chrome.webNavigation.onCommitted.addListener(function (ev) {
    hbarForPage(ev.url, ev.tabId);
});

// TODO handle onTabReplaced event.
