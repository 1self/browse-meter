window.addEventListener("load", executeOnLoadTasks);


function executeOnLoadTasks() {

    document.querySelector('#btn-yes').addEventListener('click', function(event) {
        // Permissions must be requested from inside a user gesture, like a button's
        // click handler.
        chrome.permissions.contains({
          permissions: ['history']
        }, function (gotHistoryPerm) {
          if (gotHistoryPerm) {
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
      var el = document.getElementById("overlay");
      el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
    });

    document.querySelector('.modal_close').addEventListener('click', function(event) {
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

  var numberOfWeeks = 0;
  var totalWeeks = 15;
  var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  // var fromDate = (new Date).getTime() - microsecondsPerWeek;
  // var toDate = (new Date).getTime();
  var completedWeeks = 0;
  var now = (new Date).getTime();

  var $weekCountActive = $('.week-count-active');
  var $weekCountTotal = $('.week-count-total');

  $weekCountActive.text(completedWeeks);
  $weekCountTotal.text(totalWeeks);

  $('.button-row-1').hide();
  $('.doing-row').show();

  var onCompletion = function(loop) {
    completedWeeks++;
    if (completedWeeks === totalWeeks) {
      $('.doing-row').hide();
      $('.done-row').toggleClass('hide table');      
    } else {
      $weekCountActive.text(completedWeeks);
    }
    loop();
  };

  // while (numberOfWeeks < totalWeeks) {
  //   searchHistoryAndCreateEvents(fromDate, toDate, onCompletion);
  //   numberOfWeeks++;
  //   toDate = fromDate;
  //   fromDate = toDate - microsecondsPerWeek;
  //   console.log('numberOfWeeks', numberOfWeeks);
  // }

  asyncLoop({
    length : totalWeeks,
    functionToLoop : function(loop, i) {
        var toDate = now - (microsecondsPerWeek * i);
        var fromDate = now - (microsecondsPerWeek * (i + 1));
        console.log(toDate, fromDate, i);
        searchHistoryAndCreateEvents(fromDate, toDate, onCompletion, loop);

        // setTimeout(function(){
        //     document.write('Iteration ' + i + ' <br>');
        //     loop();
        // },1000);
    },
    callback : function(){
        console.log('All done!');
    }    
  });
}

function asyncLoop(o) {
    var i=-1;

    var loop = function() {
        i++;
        if (i == o.length) {
          o.callback();
          return;
        }
        o.functionToLoop(loop, i);
    };

    loop();//init
}

function searchHistoryAndCreateEvents(fromDate, toDate, callback, loop) {
  var fromDt = new Date(fromDate), toDt = new Date(toDate);
  // fromDt = fromDt.setTime(fromDate);
  // toDt = toDt.setTime(toDate);
  console.log(fromDate, fromDt, toDate, toDt);
  chrome.history.search({
    'text': '',           
    'startTime': fromDate,
    'endTime': toDate,
    'maxResults': 100000
    },
    function(historyItems) {
      // For each history item, get details on all visits.
      
      if (historyItems.length === 0) {
        console.log('no history', fromDate, toDate);
        callback(loop);
      } else {
        var hostsList = getExistingHosts();
        var eventsMaster = [];
        var numProcessed = 0;

        var onCompletion = function(ev, numberProcessed) {
          if (ev)
            eventsMaster.push(ev);

          if (numProcessed === historyItems.length) {
            console.log('history count', historyItems.length);
            console.log('events count', eventsMaster.length);

            sendEventsBatch(eventsMaster);  
            callback(loop);       
          }
        };

        historyItems.forEach(function (historyItem) {
          var host = parseURL(historyItem.url).host;
          var visitDate = new Date(historyItem.lastVisitTime);
          var ev = null;

          numProcessed++;

          if (host && isHostInTrackingList(host, hostsList)) {
            // console.log(historyItem);
            ev = constructEvent(host, visitDate);
          }
          
          onCompletion(ev, numProcessed);

        });        
      }
  });
}