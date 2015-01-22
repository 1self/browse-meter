var PREDEFINED_HOSTS = ["youtube", "facebook", "google", "wikipedia", "amazon", "yahoo", "twitter", "linkedin", "ebay", "reddit", "pinterest", "instagram", "imgur", "netflix", "msn", "stackoverflow", "dropbox", "cnn", "walmart", "dailymotion", "baidu", "bing", "blogger", "paypal"];

var oneself = new Lib1self({
    "appName": '1self browse-meter',
    "appVersion": '1.0.0',
    "appId": "app-id-75441150bce89bef25c26a4e2acf429e",
    "appSecret": "app-secret-f81d333ac301ec2b0dd5d757ffb2db6dc6607966a52a8a5d06b58f84b3a72446"
});

if(!window.localStorage.data){
    oneself.registerStream(function(response) {
        if (response) {
            window.localStorage.data = JSON.stringify(response);
        }
    });
}

var getVizUrl = function(host) {
    var data = JSON.parse(window.localStorage.data),
    objectTags = [host], 
    actionTags = ["browse"],
    property = "times-visited";

    var vizUrl = oneself
        .visualize(data.streamid, data.readToken)
        .objectTags(objectTags)
        .actionTags(actionTags)
        .sum(property)
        .barChart()
        .url();

    console.log(vizUrl);

    return vizUrl;
};


var constructEventAndSend = function(url){
    var host = parseURL(url).host;

    if(!isHostInTrackingList(host)) return;

    var objectTags = [host],
    actionTags = ["browse"],
    properties = {};

    properties["times-visited"] = 1;

    var event = {
        objectTags: objectTags,
        actionTags: actionTags,
        properties: properties
    };
    
    var metaData = JSON.parse(window.localStorage.data);
    oneself.sendEvent(event, metaData.streamid, metaData.writeToken, function() {
        //alert("event sent");
    });
};

var isHostInTrackingList = function(host){
    return PREDEFINED_HOSTS.indexOf(host) !== -1;
};

function parseURL(url){
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
}