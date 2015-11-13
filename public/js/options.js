(function($) {
  "use strict"; // Start of use strict

  //function for generation of random numbers
  //from: http://stackoverflow.com/questions/1527803/
  //generating-random-numbers-in-javascript-in-a-specific-range
  function randInt(min,max)
  {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  //choose a random image as the header background
  var imageName = 'url(../img/header' + parseInt(randInt(0,2)) + '.jpg)';
  $('header').css({'background-image':imageName});

  //populate the number of miles left to go
  $.get("/userStats", function(data){
    $('.header-content-inner-number').text(data.distToGo);
  });

function validateDistance() {
    var distanceString = document.getElementById("distance").value;
    var distance = parseInt(distanceString); // this parseInt does have limitations...
    if (isNaN(distance) === true) { // check if number was entered
        alert("Distance must be filled out");
        $('alert alert-danger');
        return false;
    }
    else {
      chrome.runtime.onConnect.addListener(function(port){
        port.postMessage({chosenDistance:distance}); //send message into port as chosenDistance, used in content.js
      });
    }
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("setDistance").addEventListener("click", validateDistance);
});

function addSite() {
    var newSite = document.getElementById("distance").value;
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("addSite").addEventListener("click", validateForm);
});

})(jQuery); // End of use strict
