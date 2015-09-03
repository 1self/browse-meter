const PREDEFINED_HOSTS = ["1self", "amazon", "baidu", "bbc", "bing", "blogger", "cnn", "dailymotion", "dropbox", "ebay", "facebook", "github", "google", "imgur", "instagram", "linkedin", "msn", "netflix", "paypal", "pinterest", "reddit", "stackoverflow", "theguardian", "twitter", "walmart", "wikipedia", "yahoo", "ycombinator", "youtube"];
var appConfig = {
    "appName": '1self Visit Counter',
    "appVersion": '2.0.0',
    "appId": "app-id-b4714dc4e84c06e67ff78a3fd90b7869", // "app-id-visit-counter", 
    "appSecret": "app-secret-f3e85162d2e6b5f4b2a060b724c1d5ba9ef851919eb788209ec314d0aa67a687" //"app-secret-visit-counter",
},

endpoint = 'production',

stream,

lengthOfASessionSecs = 300;

oneself = new Lib1selfClient(appConfig, endpoint),

getVizUrl = function(host) {
    var objectTags = ["website", host], 
    actionTags = ["browse"],
    property = "pages-visited";

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

getBrowseSessions = function() {
    var browseSessions = localStorage.activeBrowseSessions;

    if (!browseSessions)
        browseSessions = [];
    else
        browseSessions = JSON.parse(browseSessions);

    return browseSessions;
},

setBrowseSessions = function(browseSessions) {
    localStorage.activeBrowseSessions = JSON.stringify(browseSessions);
},

// getBrowseSession = function(host, browseSessions) {

//     var browseSession;

//     if (!browseSessions)
//         browseSessions = getBrowseSessions();
    
//     for (var i = 0; i < browseSessions.length; i++) {
//         if (browseSessions[i].host === host) {
//             browseSession = browseSessions[i];
//             break;
//         }
//     }

//     if (!browseSession) {
//         browseSession = { 'host': host, 'lastActivityAt': 0 };
//     }

//     return browseSession;
// },

// updateBrowseSession = function(browseSession) {
//     var browseSessions = getBrowseSessions();
//     var oldBrowseSession = getBrowseSession(browseSession.host, browseSessions);

//     oldBrowseSession = browseSession;

//     localStorage.activeBrowseSessions = JSON.stringify(browseSessions);
// },

logCompletedSessionsAndUpdateForHost = function(host) {
    var browseSessions = getBrowseSessions();
    var stillActive = [];
    var now = (new Date()).getTime();
    var browseSessionToUpdate;

    for (var i = 0; i < browseSessions.length; i++) {
        var browseSession = browseSessions[i];
        var isActive = (now - browseSession.lastActivityAt < lengthOfASessionSecs * 1000);
        if (isActive) {
            stillActive.push(browseSession);
            if (browseSession.host === host) {
                browseSessionToUpdate = browseSession;
            }
        } else {
            // send browseSession to 1self
            constructEventAndSend(browseSession);
        }
    }

    if (isHostInTrackingList(host)) {
        if (!browseSessionToUpdate) {
            browseSessionToUpdate = {};
            browseSessionToUpdate.host = host;
            browseSessionToUpdate.firstActivityAt = now - 1000;
            browseSessionToUpdate.lastActivityAt = now;
            browseSessionToUpdate.pagesVisited = 1;
            stillActive.push(browseSessionToUpdate);
        } else {
            browseSessionToUpdate.lastActivityAt = now;
            browseSessionToUpdate.pagesVisited++;
        }
    }

    setBrowseSessions(stillActive);
},

checkTrackingAndSendEvent = function(url){
    console.log('in here');
    var host = parseURL(url).host;

    logCompletedSessionsAndUpdateForHost(host);

},

constructEventAndSend = function(browseSession){

    var eventEndDate = new Date();
    eventEndDate.setTime(browseSession.lastActivityAt);

    var objectTags = ["website", browseSession.host],
    actionTags = ["browse"],
    properties = {};

    properties["pages-visited"] = browseSession.pagesVisited;
    properties.browser = "chrome";
    properties.platform = "desktop";
    properties.duration = (browseSession.lastActivityAt - browseSession.firstActivityAt) / 1000;

    var event = {
        objectTags: objectTags,
        actionTags: actionTags,
        properties: properties,
        dateTime: oneself.formatLocalDateInISOWithOffset(eventEndDate)
    };
    
    var onGotStream = function(stream) {
        console.log('event', event, stream.streamid());
        oneself.sendEvent(event, stream);
    };

    if (!stream) {
        oneself.fetchStream(function(err, response) {
            if (!err) {
                stream = response;
                onGotStream(stream);
            }
        });
    } else {
        onGotStream(stream);
    }

},

isHostInTrackingList = function(host){
    return getExistingHosts().indexOf(host) !== -1;
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
    parsed_url = {}

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
};

(function(){
    //register stream
    oneself.fetchStream(function(err, response) {
        if (!err) {
            stream = response;
        }
    });

    //create existing hosts
    if(!window.localStorage.existing_hosts){
        overwriteExistingHosts(PREDEFINED_HOSTS);
    }
})();
