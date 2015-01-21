//js

chrome.tabs.onCreated.addListener(function(tab) {
    constructEventAndSend(tab.url);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){ 
    if(changeInfo.url){
        constructEventAndSend(changeInfo.url);
    }
});
