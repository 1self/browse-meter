var PREDEFINED_HOSTS = [
    "www.youtube.com",
    "www.facebook.com",
    "en.wikipedia.org",
    "www.amazon.com",
    "www.yahoo.com",
    "www.google.com",
    "www.baidu.com",
    "twitter.com",
    "www.linkedin.com",
    "www.ebay.com",
    "www.bing.com",
    "www.blogger.com",
    "www.reddit.com",
    "www.pinterest.com",
    "instagram.com",
    "imgur.com",
    "www.paypal.com",
    "www.netflix.com",
    "www.dropbox.com",
    "edition.cnn.com",
    "www.walmart.com",
    "www.dailymotion.com"
];

var oneself = new Lib1self({
    "appName": 'Hello, 1self',
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

    var parser = document.createElement('a');
    parser.href = url;
    
    if(PREDEFINED_HOSTS.indexOf(parser.hostname) === -1){
        return;
    }

    var objectTags = [parser.hostname],
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

