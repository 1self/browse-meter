window.addEventListener("load", executeOnLoadTasks);


function executeOnLoadTasks() {

    document.querySelector('#btn-yes').addEventListener('click', function(event) {
        // Permissions must be requested from inside a user gesture, like a button's
        // click handler.
        console.log('click yes');

        chrome.permissions.contains({
          permissions: ['history']
        }, function(result) {
          if (result) {
            getHistory();
          } else {
            chrome.permissions.request({
                permissions: ['history']
            }, function(granted) {
                // The callback argument will be true if the user granted the permissions.
                if (granted) {
                    console.log('granted');
                    getHistory();
                } else {
                    console.log('not granted');
                }
            });
          }
        });

        
    });

    document.querySelector('#edit-list').addEventListener('click', function(event) {
      var el = document.getElementById("overlay");
      el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
    });

    document.querySelector('#edit-list-2').addEventListener('click', function(event) {
      // $('#edit-list').trigger('click');
      var el = document.getElementById("overlay");
      el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
    });

    document.querySelector('#save-hosts').addEventListener('click', function(event) {
      var el = document.getElementById("overlay");
      el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";

      var checkboxes = $('.host-chk');
      var hostsList = [];

      for (var i = 0; i < checkboxes.length; i++) {
        var $checkbox = $(checkboxes[i]);
        if ($checkbox.val() !== '_template_') {
          hostsList.push( { host: $checkbox.val(), log: $checkbox.is(':checked') } );
        }
      }

      overwriteExistingHosts(hostsList);

    });

    document.querySelector('#cancel').addEventListener('click', function(event) {
      var el = document.getElementById("overlay");
      el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";

    });

    appendHostsHtml();

}

function appendHostsHtml() {

  var $template = $('.host-item.template');
  var $hosts = $('#hosts');
  var hostsList = getExistingHosts();

  for (var i = 0; i < hostsList.length; i++) {
    var $newHostItem = $template.clone();
    $newHostItem.removeClass('template');
    $newHostItem.find('.left-col div').text(hostsList[i].host);
    $newHostItem.find('.host-chk').val(hostsList[i].host);
    $newHostItem.find('.host-chk').prop('checked', hostsList[i].log);
    $hosts.append($newHostItem);
  }
}


function getHistory() {
  console.log('getting history');

  var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  var fromDate = (new Date).getTime() - microsecondsPerWeek * 10;

  $('.button-row-1').hide();
  $('.doing-row').show();

  chrome.history.search({
    'text': '',              // Return every history item....
    'startTime': fromDate  // that was accessed less than one week ago.
    },
    function(historyItems) {
      // For each history item, get details on all visits.
      
      var hostsList = getExistingHosts();

      for (var i = 0; i < historyItems.length; ++i) {
        var historyItem = historyItems[i];
        var host = parseURL(historyItem.url).host;
        var visitDate = new Date(historyItem.lastVisitTime);

        if (host && isHostInTrackingList(host, hostsList)) {
          constructEventAndSend(host, visitDate);

        } else {
          // console.log('nolog', host, visitDate, historyItem.url);

        }

      //   var processVisitsWithUrl = function(url) {
      //   // We need the url of the visited item to process the visit.
      //   // Use a closure to bind the  url into the callback's args.
      //   return function(visitItems) {
      //   processVisits(url, visitItems);
      //   };
      //   };
      //   chrome.history.getVisits({url: url}, processVisitsWithUrl(url));
      //   numRequestsOutstanding++;
      }

      $('.doing-row').hide();
      $('.done-row').toggleClass('hide table');
      // if (!numRequestsOutstanding) {
      //   onAllVisitsProcessed();
      // }
  });

}