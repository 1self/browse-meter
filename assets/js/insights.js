window.addEventListener("load", executeOnLoadTasks);

function executeOnLoadTasks(){
    populateSelectBarWithHosts();

    show_active_tab_visualization();
}

var populateSelectBarWithHosts = function(){
    var visualizationSelect = document.querySelector('#select_visualization');
    PREDEFINED_HOSTS.forEach(function(host){
        visualizationSelect.options[visualizationSelect.options.length] = new Option(host, host);
    });

    visualizationSelect.addEventListener("change", renderVizUrl);
};

function renderVizUrl(){
    var visualizationSelect = document.querySelector('#select_visualization'),
    host = visualizationSelect.value;

    if("" === host) return;

    var vizIframe = document.getElementById("visualization");
    vizIframe.src = getVizUrl(host);
};

var show_active_tab_visualization = function(){
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        var url = tabs[0].url,
        url_host = parseURL(url).host;

        console.log("Host found it: " +  url_host);

        if(!isHostInTrackingList(url_host)) {
            confirmAddHostAndStartTracking();
        }

        document.querySelector('#select_visualization [value="' + url_host + '"]').selected = true;
        document.querySelector('#select_visualization').dispatchEvent(new Event('change'));
    });
};