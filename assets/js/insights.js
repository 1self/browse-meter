function executeOnLoadTasks(){
    var visualizationSelect = document.getElementById('select_visualization');
    PREDEFINED_HOSTS.forEach(function(host){
        visualizationSelect.options[visualizationSelect.options.length] = new Option(host, host);
    });

    visualizationSelect.addEventListener("change", renderVizUrl);
}

function renderVizUrl(){
    var visualizationSelect = document.getElementById('select_visualization'),
    host = visualizationSelect.value;

    if("" === host) return;

    var vizIframe = document.getElementById("visualization");
    vizIframe.src = getVizUrl(host);
};

window.addEventListener("load", executeOnLoadTasks);

