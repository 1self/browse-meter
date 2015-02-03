//js

chrome.tabs.onCreated.addListener(function(tab) {
    checkTrackingAndSendEvent(tab.url);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){ 
    if(changeInfo.url){
        checkTrackingAndSendEvent(changeInfo.url);
    }
});
