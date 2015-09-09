window.addEventListener("load", executeOnLoadTasks);


function executeOnLoadTasks() {

    document.querySelector('#btn-yes').addEventListener('click', function(event) {

      var $weekCountActive = $('.week-count-active');
      var $weekCountTotal = $('.week-count-total');
      var totalWeeks = 15;

      var onIteration = function(completedWeeks) {
        $weekCountActive.text(completedWeeks);
      };

      var onEnd = function() {
        $('.doing-row').hide();
        $('.done-row').toggleClass('hide table'); 
      };

      $weekCountActive.text("0");
      $weekCountTotal.text(totalWeeks);

      $('.button-row-1').hide();
      $('.doing-row').show();
        
      getBrowserHistory(totalWeeks, onIteration, onEnd);
        
    });

    document.querySelector('#btn-no').addEventListener('click', function(event) {
      $('.button-row-1').hide();
      $('.no-thanks-row').removeClass('hide');
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


