const PREDEFINED_HOSTS = ["amazon", "baidu", "bing", "blogger", "cnn", "dailymotion", "dropbox", "ebay", "facebook", "github", "google", "imgur", "instagram", "linkedin", "msn", "netflix", "paypal", "pinterest", "reddit", "stackoverflow", "twitter", "walmart", "wikipedia", "yahoo", "ycombinator", "youtube"];
var appConfig = {
    "appName": '1self Visit Counter',
    "appVersion": '1.7.0',
    "appId": "app-id-b4714dc4e84c06e67ff78a3fd90b7869", // "app-id-visit-counter",
    "appSecret": "app-secret-f3e85162d2e6b5f4b2a060b724c1d5ba9ef851919eb788209ec314d0aa67a687" // "app-secret-visit-counter"
},

endpoint = 'production',

stream,

oneself = new Lib1selfClient(appConfig, endpoint),

getVizUrl = function(host) {
    var objectTags = [host], 
    actionTags = ["browse"],
    property = "times-visited";

    var vizUrl = oneself
        .objectTags(objectTags)
        .actionTags(actionTags)
        .sum(property)
        .barChart()
        .backgroundColor("0EB6EA")
        .url(stream);

    console.log(vizUrl);

    return vizUrl;
},

checkTrackingAndSendEvent = function(url){
    var host = parseURL(url).host;

    if(!isHostInTrackingList(host)) return;

    constructEventAndSend(host);
},

constructEvent = function(host, eventEndDate) {
    var objectTags = [host],
    actionTags = ["browse"],
    properties = {};

    properties["times-visited"] = 1;

    if (!eventEndDate)
        eventEndDate = new Date();

    var event = {
        objectTags: objectTags,
        actionTags: actionTags,
        properties: properties,
        dateTime: oneself.formatLocalDateInISOWithOffset(eventEndDate)
    };

    return event;
},

constructEventAndSend = function(host, eventEndDate) {
    var event = constructEvent(host, eventEndDate);    
    oneself.sendEvent(event, stream);
    console.log('send event', event, stream.streamid());
},

sendSyncEvent = function(startOrEnd) {
    var eventEndDate = new Date();
    var event = {
        objectTags: [ startOrEnd ],
        actionTags: [ "1self", "integration", "sync" ],
        dateTime: oneself.formatLocalDateInISOWithOffset(eventEndDate)
    };   
    oneself.sendEvent(event, stream);
    console.log('send sync ' + startOrEnd, stream.streamid());
},

sendEventsBatch = function(eventsBatch) {
    console.log('sending batch of', eventsBatch.length, 'to', stream.streamid());
    oneself.sendEvents(eventsBatch, stream);
},

isHostInTrackingList = function(host, hostsList) {
    
    if (!hostsList)
        hostsList = getExistingHosts();

    for (var i = 0; i < hostsList.length; i++) {
        if (hostsList[i].host === host && hostsList[i].log) {
            return true;
        }
    }

    return false;
},

setUpPredefinedHosts = function(hostsList) {
    var hostsObjsList = [];
    for (var i = 0; i < hostsList.length; i++) {
        hostsObjsList.push({ host: hostsList[i], log: true });
    }
    overwriteExistingHosts(hostsObjsList);
},

getExistingHosts = function(){
    return JSON.parse(window.localStorage.existing_hosts);
},

overwriteExistingHosts = function(list){
    window.localStorage.existing_hosts = JSON.stringify(list);
},

prependToExistingHosts = function(host){
    var existing_hosts = getExistingHosts();
    existing_hosts.unshift(host);

    overwriteExistingHosts(existing_hosts);
},

parseURL = function(url){
    parsed_url = {};

    if ( url == null || url.length == 0 )
        return parsed_url;

    protocol_i = url.indexOf('://');
    parsed_url.protocol = url.substr(0,protocol_i);

    remaining_url = url.substr(protocol_i + 3, url.length);
    domain_i = remaining_url.indexOf('/');
    domain_i = domain_i == -1 ? remaining_url.length - 1 : domain_i;
    parsed_url.domain = remaining_url.substr(0, domain_i);
    parsed_url.path = domain_i == -1 || domain_i + 1 == remaining_url.length ? null : remaining_url.substr(domain_i + 1, remaining_url.length);

    domain_parts = parsed_url.domain.split('.');
    switch ( domain_parts.length ){
        case 2:
          parsed_url.subdomain = null;
          parsed_url.host = domain_parts[0];
          parsed_url.tld = domain_parts[1];
          break;
        case 3:
          parsed_url.subdomain = domain_parts[0];
          parsed_url.host = domain_parts[1];
          parsed_url.tld = domain_parts[2];
          break;
        case 4:
          parsed_url.subdomain = domain_parts[0];
          parsed_url.host = domain_parts[1];
          parsed_url.tld = domain_parts[2] + '.' + domain_parts[3];
          break;
    }

    parsed_url.parent_domain = parsed_url.host + '.' + parsed_url.tld;

    return parsed_url;
},

getBrowserHistory = function(totalWeeks, onIteration, onEnd, host) {

    chrome.permissions.contains({
      permissions: ['history']
    }, function (gotHistoryPerm) {
      if (gotHistoryPerm) {
        getHistory(totalWeeks, onIteration, onEnd, host);
      } else {
        chrome.permissions.request({
            permissions: ['history']
        }, function(granted) {
            // The callback argument will be true if the user granted the permissions.
            if (granted) {
                console.log('granted');
                getHistory(totalWeeks, onIteration, onEnd, host);
            } else {
                console.log('not granted');
            }
        });
      }
    });
};

function getHistory(totalWeeks, onIteration, onEnd, host) {
  console.log('getting history');

  var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  var completedWeeks = 0;
  var now = (new Date).getTime();

  var onCompletion = function(loop) {
    completedWeeks++;
    if (completedWeeks === totalWeeks) {
        onEnd();     
    } else {
        onIteration(completedWeeks);
    }
    loop();
  };

  sendSyncEvent('start');

  asyncLoop({
    length : totalWeeks,
    functionToLoop : function(loop, i) {
        var toDate = now - (microsecondsPerWeek * i);
        var fromDate = now - (microsecondsPerWeek * (i + 1));
        searchHistoryAndCreateEvents(fromDate, toDate, onCompletion, loop, host);
    },
    callback : function(){
        console.log('All done!');
        sendSyncEvent('end');
    }    
  });
}

function asyncLoop(o) {
    var i=-1;

    var loop = function() {
        i++;
        if (i == o.length) {
          o.callback();
          return;
        }
        o.functionToLoop(loop, i);
    };

    loop();//init
}

function searchHistoryAndCreateEvents(fromDate, toDate, callback, loop, restrictToHost) {
  var fromDt = new Date(fromDate), toDt = new Date(toDate);
  // fromDt = fromDt.setTime(fromDate);
  // toDt = toDt.setTime(toDate);
  console.log(fromDate, fromDt, toDate, toDt);
  var restrictToHostTxt = restrictToHost ? restrictToHost : '';
  chrome.history.search({
    'text': restrictToHostTxt,           
    'startTime': fromDate,
    'endTime': toDate,
    'maxResults': 100000
    },
    function(historyItems) {
      // For each history item, get details on all visits.
      
      if (historyItems.length === 0) {
        console.log('no history', fromDate, toDate);
        callback(loop);
      } else {
        var hostsList = getExistingHosts();
        var eventsMaster = [];
        var numProcessed = 0;

        var onCompletion = function(ev, numberProcessed) {
          if (ev)
            eventsMaster.push(ev);

          if (numProcessed === historyItems.length) {
            console.log('history count', historyItems.length, 'events count', eventsMaster.length);

            if (eventsMaster.length > 0)
                sendEventsBatch(eventsMaster);  
            
            callback(loop);       
          }
        };

        historyItems.forEach(function (historyItem) {
          var host = parseURL(historyItem.url).host;
          var visitDate = new Date(historyItem.lastVisitTime);
          var ev = null;

          numProcessed++;

          if (host && isHostInTrackingList(host, hostsList)) {
            if (!restrictToHost || restrictToHost === host) {
                ev = constructEvent(host, visitDate);
            }
          }
          
          onCompletion(ev, numProcessed);

        });        
      }
  });
}

(function(){
    //register stream
    oneself.fetchStream(function(err, response) {
        console.log('fetched stream');
        if (!err) {
            stream = response;
        }
    });

    if(!localStorage.first && !window.localStorage.existing_hosts) {
        chrome.tabs.create({
           url : "thanks.html"
        });
        localStorage.first = "true";
    }

    //create existing hosts
    if (!window.localStorage.existing_hosts){
        setUpPredefinedHosts(PREDEFINED_HOSTS);
    } else {
        var hostsList = getExistingHosts();
        if (hostsList.length > 0 && typeof hostsList[0] !== "object") {
            setUpPredefinedHosts(hostsList);
        }
    }
})();
