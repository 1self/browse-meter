var PREDEFINED_HOSTS = [
    "www.youtube.com",
    "www.facebook.com"
];

var oneself = new Lib1self({
    "appName": 'Hello, 1self',
    "appVersion": '1.0.0',
    "appId": "app-id-fado8423dfjoafj09jfasjf02wjf203r",
    "appSecret": "app-secret-b4f75f422d34f9bc42cc6572ecd04aea392cc7488c31f6b7818487ec8f82e8e8"
});

var getVizUrl = function(host) {
    var data = JSON.parse(window.localStorage.data),
    objectTags = [host], 
    actionTags = ["browse"],
    property = "visited-" + host;

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

    properties["visited-" + parser.hostname] = 1;

    var event = {
        objectTags: objectTags,
        actionTags: actionTags,
        properties: properties
    };
    
    var metaData = JSON.parse(window.localStorage.data);
    oneself.sendEvent(event, metaData.streamid, metaData.writeToken, function() {
        alert("event sent");
    });
};


if(!window.localStorage.data){
    oneself.registerStream(function(response) {
        if (response) {
            window.localStorage.data = JSON.stringify(response);
        }
    });
}
