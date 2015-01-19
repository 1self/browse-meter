//js

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({url:chrome.extension.getURL("insights.html")});
});

chrome.tabs.onCreated.addListener(function(tab) {
    constructEventAndSend(tab.url);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){ 
    if(changeInfo.url){
        constructEventAndSend(changeInfo.url);
    }
});