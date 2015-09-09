window.addEventListener("load", executeOnLoadTasks);

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event) {
    console.log(event.data);
    if (event.data.loginUrl !== undefined) {
        var redirectUrl = window.location.protocol + "//" + window.location.host + "/message.html";
        var loginUrl = event.data.loginUrl + '?redirectUrl=' + redirectUrl;
        loginUrl = loginUrl + '&intent=' + event.data.intent;
        console.log(loginUrl);
        chrome.tabs.create({
            url: loginUrl
        });
    }
}

function executeOnLoadTasks() {
    populateSelectBarWithHosts();

    show_active_tab_visualization();

    var vizIframe = document.querySelector("#visualization");
    vizIframe.addEventListener("load", function() {
        hideAjaxLoader();
    });

    var brand_icon = document.querySelector('#oneself_icon');
    brand_icon.addEventListener("click", function() {
        chrome.tabs.create({
            url: "http://1self.co"
        });
    });

    var modal_close = document.querySelector('.modal_close');
    modal_close.addEventListener("click", function() {
        closeModal();
    });

    var okay_to_track = document.querySelector('#okay_to_track');
    okay_to_track.addEventListener("click", function() {
        // closeModal();
        startTrackingCurrentHost();
        askAboutHistory();
    });

    var cancel_tracking = document.querySelector('#cancel_tracking');
    cancel_tracking.addEventListener("click", function() {
        closeModal();
    });

    var get_history = document.querySelector('#get_history');
    get_history.addEventListener("click", function() {
        var host = document.querySelector('#new_hostname').innerHTML;
        var weekCountActive = document.querySelector('.week-count-active');
        var weekCountTotal = document.querySelector('.week-count-total');
        var totalWeeks = 15;

        var onIteration = function(completedWeeks) {
            weekCountActive.innerHTML = completedWeeks;
        };

        var onEnd = function() {
            document.querySelector('.getting-history').style.display = "none";
            document.querySelector('.finished-history').style.display = "block";
        };

        weekCountActive.innerHTML = "0";
        weekCountTotal.innerHTML = totalWeeks;

        document.querySelector('.get-history').style.display = "none";
        document.querySelector('.getting-history').style.display = "block";

        getBrowserHistory(totalWeeks, onIteration, onEnd, host);

    });

    var finished_history = document.querySelector('#finished_history');
    finished_history.addEventListener("click", function() {
        var host = document.querySelector('#new_hostname').innerHTML;
        updateSelectAndLoadVisualization(host);
        closeModal();
    });

    var cancel_history = document.querySelector('#cancel_history');
    cancel_history.addEventListener("click", function() {
        var host = document.querySelector('#new_hostname').innerHTML;
        if (host && host !== "" && host !== "undefined")
            logCurrentVisit(host);

        closeModal();
    });
}

var populateSelectBarWithHosts = function(host) {
    var visualizationSelect = document.querySelector('#select_visualization');

    if (visualizationSelect.options.length === 1) {
        getExistingHosts().forEach(function(hostObj) {
            visualizationSelect.options[visualizationSelect.options.length] = new Option(hostObj.host, hostObj.host);
        });

        visualizationSelect.addEventListener("change", renderVizUrl);
    } else if (host) {
        visualizationSelect.options[visualizationSelect.options.length] = new Option(host, host);
    }
};

function renderVizUrl() {
    var visualizationSelect = document.querySelector('#select_visualization'),
        host = visualizationSelect.value;

    if ("" === host) return;

    showAjaxLoader();

    var vizIframe = document.querySelector("#visualization");
    vizIframe.src = getVizUrl(host);
}

var show_active_tab_visualization = function() {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function(tabs) {
        var url = tabs[0].url,
            url_host = parseURL(url).host;

        console.log("Host found is: " + url_host);

        if (url_host) {
            if (!isHostInTrackingList(url_host) && ("undefined" !== typeof url_host)) {
                confirmAddHost(url_host);
                return;
            }

            updateSelectAndLoadVisualization(url_host);
        }
    });
};

var confirmAddHost = function(host) {
    document.querySelector('#new_hostname').innerHTML = host;
    document.querySelector('#new_hostname_2').innerHTML = host;
    document.querySelector('#new_hostname_3').innerHTML = host;
    document.querySelector('.modalDialog').style.display = "block";
};

var closeModal = function() {
    document.querySelector('.modalDialog').style.display = "none";
};

var updateSelectAndLoadVisualization = function(host) {
    document.querySelector('#select_visualization [value="' + host + '"]').selected = true;
    document.querySelector('#select_visualization').dispatchEvent(new Event('change'));
};

var showAjaxLoader = function() {
    var loader = document.querySelector(".ajax_loader");
    loader.style.display = "block";
};

var hideAjaxLoader = function() {
    var loader = document.querySelector(".ajax_loader");
    loader.style.display = "none";
};

var startTrackingCurrentHost = function() {
    var host = document.querySelector('#new_hostname').innerHTML;
    var hostObj = {
        host: host,
        log: true
    };

    prependToExistingHosts(hostObj);

    console.log("New host '" + host + "' added to list");
    populateSelectBarWithHosts(host);
};

var logCurrentVisit = function(host) {
    constructEventAndSend(host);
    updateSelectAndLoadVisualization(host);
};

var askAboutHistory = function() {
    document.querySelector(".add-new-host").style.display = "none";
    document.querySelector(".get-history").style.display = "block";
};
