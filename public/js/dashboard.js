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


    
  Chart.defaults.global.responsive = true;
  //extend the bar graph prototype to get behavior where we
  //can overlay a horizontal line of our own
  Chart.types.Bar.extend({
      name: "BarWithLine",
      initialize: function () {
          Chart.types.Bar.prototype.initialize.apply(this, arguments);
      },
      draw: function () {
          Chart.types.Bar.prototype.draw.apply(this, arguments);
          var scale = this.scale
          var linePos = scale.calculateY(this.options.lineAtPos);

          // draw line
          this.chart.ctx.beginPath();
          this.chart.ctx.moveTo(scale.startPoint+12, linePos);
          this.chart.ctx.strokeStyle = '#000';
          this.chart.ctx.lineTo(this.chart.width, linePos);
          this.chart.ctx.stroke();
          
          // write label for line
          this.chart.ctx.textAlign = 'center';
          var lineLabel = this.options.lineLabel;
          this.chart.ctx.fillStyle = '#000000';
          this.chart.ctx.fillText(lineLabel, scale.startPoint + 60, linePos-15);
      }
  });

  //get json object (faked right now for testing)
  var graphData = {
    xlabels: ["9/08","9/09","9/10","9/11","9/12","9/13","9/14"],
    ys: [0,4,6,2,1,9,11],
    goal: 50,
    goalLabel: "Your weekly target",
    graphTitle: "miles biked daily",
    //week begin time in terms of date.getMilliSeconds()
    weekBeginTime: 901238902130
  };

  //create bar graph
  var ctx = document.getElementById("myChart").getContext("2d");
  var data = {
      labels: graphData.xlabels,
      datasets: [
          {
              label: graphData.goalLabel,
              fillColor: "#eb3812",
              strokeColor: "#eb3812",
              pointStrokeColor: "#000",
              pointHighlightFill: "#000",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: graphData.ys
          },
      ]
  };
  var scaleOverride = false;
  if(graphData.goal > Math.max.apply(Math, graphData.ys)){
    //override the scale in order to show the goal line
    scaleOverride = true;
  }
  var options = {     
    // Boolean - If we want to override with a hard coded scale
    scaleOverride: scaleOverride,
    // ** Required if scaleOverride is true **
    // Number - The number of steps in a hard coded scale
    scaleSteps: 8,
    // Number - The value jump in the hard coded scale
    scaleStepWidth: Math.floor(graphData.goal / 7),
    // Number - The scale starting value
    scaleStartValue: 0,
    scaleFontFamily : "'Open Sans','Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
    scaleFontColor: "#000",
    scaleFontSize: 15,
    pointLabelFontFamily : "'Open Sans','Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
    pointLabelFontColor: "#000",
    scaleFontSize: 15,
    lineAtPos: graphData.goal,
    lineLabel: "weekly goal"
  };
  var myBarChart = new Chart(ctx).BarWithLine(data, options);

  //create event handlers for left and right buttons
  $('#chartLeft').click(function(){
    console.log('left clicked!');
  });

  $('#chartRight').click(function(){
    console.log('right clicked!');
  });

})(jQuery); // End of use strict
