window.addEventListener("load", executeOnLoadTasks);

function executeOnLoadTasks(){
    populateSelectBarWithHosts();

    show_active_tab_visualization();

    var vizIframe = document.querySelector("#visualization");
    vizIframe.addEventListener("load", function(){
        hideAjaxLoader();
    });
}

var populateSelectBarWithHosts = function(){
    var visualizationSelect = document.querySelector('#select_visualization');
    getExistingHosts().forEach(function(host){
        visualizationSelect.options[visualizationSelect.options.length] = new Option(host, host);
    });

    visualizationSelect.addEventListener("change", renderVizUrl);
};

function renderVizUrl(){
    var visualizationSelect = document.querySelector('#select_visualization'),
    host = visualizationSelect.value;

    if("" === host) return;

    showAjaxLoader();

    var vizIframe = document.querySelector("#visualization");
    vizIframe.src = getVizUrl(host);
};

var show_active_tab_visualization = function(){
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        var url = tabs[0].url,
        url_host = parseURL(url).host;

        console.log("Host found is: " +  url_host);

        if(!isHostInTrackingList(url_host)) {
            if("undefined" !== typeof url_host) confirmAddHostAndStartTracking(url_host);
            return;
        }
        
        updateSelectAndLoadVisualization(url_host);
    });
};

var updateSelectAndLoadVisualization = function(host){
    document.querySelector('#select_visualization [value="' + host + '"]').selected = true;
    document.querySelector('#select_visualization').dispatchEvent(new Event('change'));
};

var showAjaxLoader = function(){
    var loader = document.querySelector(".ajax_loader");
    loader.style.display = "block";
};

var hideAjaxLoader = function(){
    var loader = document.querySelector(".ajax_loader");
    loader.style.display = "none";
};

var confirmAddHostAndStartTracking = function(host){
    var confirmedAddingHost = confirm("The visits to '"+ host + "' are not counted by browse meter. Do you want to add it?");

    if(confirmedAddingHost){
        prependToExistingHosts(host);
        console.log("New host '" + host + "' added to list");

        populateSelectBarWithHosts();
        updateSelectAndLoadVisualization(host);
    }else{
        console.log("User denied adding '" + host + "' to list");
    }
}