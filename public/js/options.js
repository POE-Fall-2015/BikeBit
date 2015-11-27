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
    if (data.distToGo > 0){
      $('#distance').prop('disabled', true);
      $('#setDistance').prop('disabled', true);
      $('#day').prop('disabled', true);
      $('#week').prop('disabled', true);
      $('#cant-change-warning').toggle();
    }
  });

// GOAL RATE

  function setGoalRate(){
    $.get("/userStats", function(data){
      var goalRate = data.users.goalRate;
      if (goalRate === "week"){
        $("#week").prop('checked',true);
      }
      if (goalRate === "day"){
        $("#day").prop('checked', true);
      }
    });
  }
  setGoalRate();

  function updateGoalRate(newRate){
    $.ajax({
      url:"/user", 
      method: "PATCH",
      data: { goalRate : newRate }});
    setGoalRate()
  }

  $('#goalRate :input').change( function() {
   updateGoalRate(this.value);
  })

 //var filterDay = $('#goalRate input:radio:checked').val();
 // console.log(filterDay);

// BLOCKED DOMAINS
//sets blocked site list on open/refresh
  $.get("/userStats", function(data){
    var blockedSites = data.users.blockedDomains;
    console.log(blockedSites);
    for(var i = 0; i < blockedSites.length; i++){
      var blockedSite = blockedSites[i];
      $("#blockSiteList").append('<li>' + blockedSite + '   <div class="glyphicon glyphicon-remove"> </div>'+'</li>');
    }
  });

//updates block sites list to reflect adding/removing sites
  function updateBlockedDomains(newBlockedDomains){
    $("#blockSiteList").empty(); 
    $.get("/userStats", function(data){
      console.log(newBlockedDomains);
      for(var i = 0; i < newBlockedDomains.length; i++){
        var blockedSite = newBlockedDomains[i];
        $("#blockSiteList").append('<li>' + blockedSite + '   <div class="glyphicon glyphicon-remove"> </div>'+'</li>');
      }
    });
  }

  function addSite() {
    var newSite = document.getElementById("domain").value;
    $.get("/userStats", function(data){
      var currentlyBlocking = data.users.blockedDomains;
      currentlyBlocking.push(newSite);
      updateBlockedDomains(currentlyBlocking);
      $.ajax({
        url:"/user", 
        method: "PATCH",
        data: { blockedDomains : currentlyBlocking }});
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("addSite").addEventListener("click", addSite);
  });

  function removeSite(siteIndex) {
    $.get("/userStats", function(data){
      var currentlyBlocking = data.users.blockedDomains;
      currentlyBlocking.splice(siteIndex, 1);
      updateBlockedDomains(currentlyBlocking);
      console.log(currentlyBlocking);
      $.ajax({
        url:"/user", 
        method: "PATCH",
        data: { blockedDomains : currentlyBlocking }});
    });
  }

  $('#blockSiteList').on('click', 'li', function(){
    var site = $(this).index();
    console.log(site);
    removeSite(site);
  })

// GOAL DISTANCE
  function updateGoal(distance){
    $('.min-miles-number').text(distance);
  }

  function validateDistance() {
      var distanceString = document.getElementById("distance").value;
      var distance = parseInt(distanceString); // this parseInt does have limitations...
      if (isNaN(distance) === true) { // check if number was entered
          alert("Distance must be filled out");
          $('alert alert-danger');
          return false;
      }
      else {
        $.ajax({
          url:"/user", 
          method: "PATCH",
          data: { goalDistance : distance }});
        updateGoal(distance);
      }
  }

  document.addEventListener("DOMContentLoaded", function() {
      document.getElementById("setDistance").addEventListener("click", validateDistance);
  });

})(jQuery); // End of use strict
