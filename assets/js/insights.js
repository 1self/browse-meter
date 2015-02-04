window.addEventListener("load", executeOnLoadTasks);

function executeOnLoadTasks(){
    populateSelectBarWithHosts();

    show_active_tab_visualization();

    var vizIframe = document.querySelector("#visualization");
    vizIframe.addEventListener("load", function(){
        hideAjaxLoader();
    });

    var brand_icon = document.querySelector('#oneself_icon');
    brand_icon.addEventListener("click", function(){
        chrome.tabs.create({url: "http://1self.co"});
    });

    var modal_close = document.querySelector('.modal_close');
    modal_close.addEventListener("click", function(){
        closeModal();
    });

    var okay_to_track = document.querySelector('#okay_to_track');
    okay_to_track.addEventListener("click", function(){
        startTracking(host);
    });

    var cancel_tracking = document.querySelector('#cancel_tracking');
    cancel_tracking.addEventListener("click", function(){
        closeModal();
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

        if(!isHostInTrackingList(url_host) && ("undefined" !== typeof url_host)) {
            confirmAddHost(url_host);
            return;
        }
        
        updateSelectAndLoadVisualization(url_host);
    });
};


var confirmAddHost = function(host){
    document.querySelector('#new_hostname').innerHTML = host;
    document.querySelector('.modalDialog').style.display = "block";
};

var closeModal = function(){
    document.querySelector('.modalDialog').style.display = "none";
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

var startTracking = function(host){
    var confirmedAddingHost = confirm("The visits to '"+ host + "' are not counted by Visit Counter. Do you want to add it?");

    if(confirmedAddingHost){
        prependToExistingHosts(host);
        console.log("New host '" + host + "' added to list");
        
        constructEventAndSend(host);

        populateSelectBarWithHosts();
        updateSelectAndLoadVisualization(host);
    }else{
        console.log("User denied adding '" + host + "' to list");
    }
}