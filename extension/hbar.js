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
                    var hit = js.hits[0],
                          hita = document.createElement('a'),
                          pga  = document.createElement('a');
                    hita.href = hit.url;
                    pga.href = url;
                    if (hita.hostname === pga.hostname) {
                        return callback(true, hit.objectID, hit.points);
                    }
                }
            }

            return callback(false);
        }
    };
    request.send();
};

var hbarForPage = function (url, tabId) {
    findItemForPage(url, function (exists, hnId, hnPoints) {
        var tabStr = Number(tabId).toString();
        if (exists) {
            setPageActionIcon(tabId, Number(hnPoints).toString());
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

var setPageActionIcon = function (tab, text) {
    /* See:
     * http://chat.stackoverflow.com/transcript/message/13972713#13972713
     */
    var canvas19 = document.createElement('canvas'),
        canvas38 = document.createElement('canvas'),
        img19 = document.createElement('img'),
        img38 = document.createElement('img'),
        id19 = null,
        id38 = null,
        draw = function (size, canvas, img) {
            return function () {
                /* Draw the background image */
                var context = canvas.getContext('2d');
                context.drawImage(img, 0, 0, size, size);

                /* Draw some text */
                context.fillStyle = "white";
                var fontSize = size == 19 ? 8 : 16;
                context.font = "bold "+ fontSize +"px Sans-Serif";
                var tw = context.measureText(text);
                context.fillText(text, (size - tw.width)/2, size - 1, size);
                dest = context.getImageData(0, 0, size, size);

                if (size == 19)
                    id19 = dest;
                else
                    id38 = dest;

                if (id19 && id38) {
                    chrome.pageAction.setIcon({
                        imageData: {'19': id19, '38': id38 },
                        tabId:     tab
                    });
                }
            };
        };

    img19.onload = draw(19, canvas19, img19);
    img38.onload = draw(38, canvas38, img38);
    img19.src = "images/hn-19.png";
    img38.src = "images/hn-38.png";
};

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
