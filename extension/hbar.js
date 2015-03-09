/**
 * Find the item on HN using the search api for this page.
 * @return {Bool} True or false if there is an item for this page.
 */
var findItemForPage = function (url, callback) {
    var request = new XMLHttpRequest(),
         params = 'query="' + encodeURIComponent(url) + '"&' +
            'restrictSearchableAttributes=url&' +
            'typoTolerance=false';
    request.open('GET',
                 'http://hn.algolia.com/api/v1/search?' + params);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            if (request.status === 200) {
                var js = JSON.parse(request.responseText);
                if (js.hits && js.hits.length) {
                    var hit = js.hits[0];
                    if (hit.url === url) {
                        return callback(true, hit.objectID);
                    }
                }
            }

            return callback(false);
        }
    };
    request.send();
};

var hbarForPage = function (url, tabId) {
    findItemForPage(url, function (exists, hnId) {
        var tabStr = Number(tabId).toString();
        if (exists) {
            chrome.pageAction.show(tabId);
            var data = {};
            data[tabStr] = 'https://news.ycombinator.com/item?id='+hnId;
            chrome.storage.local.set(data);
        }
    });
};

// Event handlers
chrome.webNavigation.onCommitted.addListener(function (ev) {
    if (ev.frameId === 0)
        hbarForPage(ev.url, ev.tabId);
});

chrome.pageAction.onClicked.addListener(function (tab) {
    var tabString = Number(tab.id).toString();
    chrome.storage.local.get(tabString, function (items) {
        if (items[tabString]) {
            chrome.tabs.create({
                'url': items[tabString],
                'openerTabId': tab.id
            });
        }
        chrome.storage.local.remove(tabString);
    });
});
