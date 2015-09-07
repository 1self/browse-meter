const PREDEFINED_HOSTS = ["amazon", "baidu", "bing", "blogger", "cnn", "dailymotion", "dropbox", "ebay", "facebook", "github", "google", "imgur", "instagram", "linkedin", "msn", "netflix", "paypal", "pinterest", "reddit", "stackoverflow", "twitter", "walmart", "wikipedia", "yahoo", "ycombinator", "youtube"];
var appConfig = {
    "appName": '1self Visit Counter',
    "appVersion": '1.0.0',
    "appId": "app-id-b4714dc4e84c06e67ff78a3fd90b7869",
    "appSecret": "app-secret-f3e85162d2e6b5f4b2a060b724c1d5ba9ef851919eb788209ec314d0aa67a687"
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
        .backgroundColor("1b1b1a")
        .url(stream);

    console.log(vizUrl);

    return vizUrl;
},

checkTrackingAndSendEvent = function(url){
    var host = parseURL(url).host;

    if(!isHostInTrackingList(host)) return;

    constructEventAndSend(host);
},

constructEventAndSend = function(host){
    var objectTags = [host],
    actionTags = ["browse"],
    properties = {};

    properties["times-visited"] = 1;

    var event = {
        objectTags: objectTags,
        actionTags: actionTags,
        properties: properties
    };
    
    oneself.sendEvent(event, stream);
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
