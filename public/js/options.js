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

  $.get("/userStats", function(data){
    $('.min-miles-number').text(data.users.goalDistance);
  });

  $.get("/userStats", function(data){
    var blockedSites = data.users.blockedDomains;
    console.log(blockedSites);
    for(var i = 0; i < blockedSites.length; i++){
      var blockedSite = blockedSites[i];
      $("#blockSiteList").append('<li>' + blockedSite + '   <div class="glyphicon glyphicon-remove"> </div>'+'</li>');
    }
  });

  $('#blockSiteList').on('click', 'li', function(){
    var site = $(this).index();
    console.log(site);
    removeSite(site);
  })

  function updateBlockedDomains(newBlockedDomains){
    $("#blockSiteList").empty(); 
    $.get("/userStats", function(data){
      //var blockedSites = data.users.blockedDomains;
      console.log(newBlockedDomains);
      for(var i = 0; i < newBlockedDomains.length; i++){
        var blockedSite = newBlockedDomains[i];
        $("#blockSiteList").append('<li>' + blockedSite + '   <div class="glyphicon glyphicon-remove"> </div>'+'</li>');
      }
    });
  }
// function validateDistance() {
//     var distanceString = document.getElementById("distance").value;
//     var distance = parseInt(distanceString); // this parseInt does have limitations...
//     if (isNaN(distance) === true) { // check if number was entered
//         alert("Distance must be filled out");
//         $('alert alert-danger');
//         return false;
//     }
//     else {
//       chrome.runtime.onConnect.addListener(function(port){
//         port.postMessage({chosenDistance:distance}); //send message into port as chosenDistance, used in content.js
//       });
//     }
// }

// document.addEventListener("DOMContentLoaded", function() {
//     document.getElementById("setDistance").addEventListener("click", validateDistance);
// });

function addSite() {
    var newSite = document.getElementById("domain").value;
    $.get("/userStats", function(data){
      var currentlyBlocking = data.users.blockedDomains;
      currentlyBlocking.push(newSite);
      updateBlockedDomains(currentlyBlocking);
      //console.log(currentlyBlocking);
      //console.log(newSite);  
      $.ajax({
        url:"/user", 
        method: "PATCH",
        data: { blockedDomains : currentlyBlocking }});
    });
    // updateBlockedDomains(currentlyBlocking);
}

function removeSite(siteIndex) {
  $.get("/userStats", function(data){
    var currentlyBlocking = data.users.blockedDomains;
    // var index = currentlyBlocking.indexOf(siteToDelete);
    // if (index >= 0) {
    //  arr.splice( index, 1 );
    // }
    currentlyBlocking.splice(siteIndex, 1);
    updateBlockedDomains(currentlyBlocking);
    console.log(currentlyBlocking);
    //console.log(newSite);  
    $.ajax({
      url:"/user", 
      method: "PATCH",
      data: { blockedDomains : currentlyBlocking }});
  });
  // updateBlockedDomains(currentlyBlocking);
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("addSite").addEventListener("click", addSite);
});

})(jQuery); // End of use strict
