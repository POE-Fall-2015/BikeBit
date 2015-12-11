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
    var distMsg;
    var distUnits = data.users.goalUnits;
    if(data.distToGo < 1){
      distMsg = "Less than 1 " + distUnits + " to go!";
    } else {
      distMsg = ((data.distToGo).toFixed(2).replace(/\.?0+$/, "")) + " " + distUnits + " to go!";
    }
    $('.header-content-inner-number').text(distMsg);
  });

  //holds the bar chart object
  var myBarChart;

  //graphTime variable keeps track of the week that
  //graph currently is showing
  var date = new Date();
  var graphTime = date.getTime();
  var week = 1000*60*60*24*7; //ms per week

  //click handler for clicking to see previous week's graph
  var getPrevGraph = function(){
    graphTime -= week;
    $.get("/graphData", {graphTime:graphTime}, function(graphData){
      drawGraph(graphData);
    });
  };

  //click handler for clicking to see next week's graph
  var getNextGraph = function(){
    graphTime += week;
    $.get("/graphData", {graphTime:graphTime}, function(graphData){
      drawGraph(graphData);
    });
  };

  function drawGraph(graphData){
    if(myBarChart != null){
      myBarChart.destroy();
    };
    //draw bar graph
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
    var options = {
      scaleStartValue: 0,
      scaleFontFamily : "'Open Sans','Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
      scaleFontColor: "#000",
      scaleFontSize: 15,
      pointLabelFontFamily : "'Open Sans','Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
      pointLabelFontColor: "#000",
      scaleFontSize: 15,
      lineAtPos: graphData.goal,
      lineLabel: graphData.goalLabel
    };
    myBarChart = new Chart(ctx).BarWithLine(data, options);
    $('#chartTitle').html(graphData.graphTitle);
  };

  function initializeGraph(graphData){
    //initial setup
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
            this.chart.ctx.moveTo(scale.startPoint+40, linePos);
            this.chart.ctx.strokeStyle = '#000000';
            this.chart.ctx.lineTo(this.chart.width, linePos);
            this.chart.ctx.stroke();
            this.chart.ctx.textAlign = 'center';
            // goal line may or may not be visible depending on the
            // scale of the graph
            var goalVisible = this.options.lineAtPos <= this.scale.max;
            if(goalVisible){
              // draw label next to goal line
              var lineLabel = this.options.lineLabel;
              this.chart.ctx.fillStyle = '#000000';
              this.chart.ctx.fillText(lineLabel, scale.endPoint, linePos-15);
            } else {
              // draw label in specific place
              var lineLabel = this.options.lineLabel;
              this.chart.ctx.fillStyle = '#000000';
              this.chart.ctx.fillText(lineLabel, scale.startPoint + 150, 30);
            }
        }
    });
    drawGraph(graphData);
    //create event handlers for left and right buttons
    $('#chartLeft').click(getPrevGraph);
    $('#chartRight').click(getNextGraph);
  };

  //get json object (faked right now for testing)
  $.get("/graphData", {graphTime:graphTime}, function(graphData){
    initializeGraph(graphData);
  });

})(jQuery); // End of use strict
