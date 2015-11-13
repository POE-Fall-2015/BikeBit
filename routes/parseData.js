var BikeSession = require('../models/bikeSessionModel.js').bikeSession;

function getMinDate() {
  return new Date(-8640000000000000);
}

function getMonday() {
  //returns first monday before current date, w/ time zeroed
  //from http://stackoverflow.com/questions/4156434/
  //javascript-get-the-first-day-of-the-week-from-current-date
  var date = new Date();
  var day = date.getDay() || 7;  
  if( day !== 1 ) 
    date.setHours(-24 * (day - 1)); 
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  return date;
}

function getTimeRangeSessions(beg,end,callback){
  //returns all bikesessions that fall in time range
  //and calls callback with list of those sessions
  BikeSession.find({createdAt: {
    $gt: beg, $lt: end
  }}).exec(function (err, bikeSessions) {
    if(err){
      callback(err, []);
    } else {
      callback(err, bikeSessions);
    }
  });
}

function getTimeRangeRotations(beg,end,callback){
  getTimeRangeSessions(beg,end,function(err, bikeSessions){
    var rotations = 0;
    bikeSessions.forEach(function(b){
      rotations += b.rotations;
    });
    callback(err, rotations);
  });
}

function getWeekRotations(callback){
  getTimeRangeRotations(getMonday(),new Date(),callback);
}

function getDailyRotations(callback){
  var todayStart = new Date();
  todayStart.setHours(0);
  todayStart.setMinutes(0);
  todayStart.setSeconds(0);
  getTimeRangeRotations(todayStart,new Date(),callback);
}

function getLifetimeRotations(callback){
  getTimeRangeRotations(getMinDate(),new Date(),callback);
}

function rotationsToMiles(rotations){
  //PLACEHOLDER VARIABLES UNTIL SETTINGS OBJECT IS IMPLEMENTED
  var measureWheelSize = 3;
  var inchesPerMile = 63360.0;
  //PLACEHOLDER VARIABLES END
  return rotations * measureWheelSize / inchesPerMile;
}

var getUserStats = function(req, res){
  //PLACEHOLDER VARIABLES UNTIL SETTINGS OBJECT IS IMPLEMENTED
  var goalRate = "week";
  var goalDistance = 20;
  var wheelSize = 27;
  //PLACEHOLDER VARIABLES END
  var callback = function(err, progressRotations){
    if(err){ res.status(500).send("Error getting sessions!"); console.log(err); }
    var progressDistance = rotationsToMiles(progressRotations);
    var canAccess = progressDistance >= goalDistance;
    var distToGo = goalDistance - progressDistance;
    getLifetimeRotations(function(err, lifetimeRotations){
      if(err){ res.status(500).send("Error getting sessions!"); console.log(err); }
      var stats = {"canAccess":canAccess, distToGo:distToGo, progress:progressDistance, 
        lifetimeTotal:rotationsToMiles(lifetimeRotations)};
      res.status(200).json(stats);
    });
  };
  if(goalRate === "week"){
    getWeekRotations(callback);
  } else if (goalRate == "day") {
    getDailyRotations(callback);
  } else {
    res.status(500).send("goalRate is set incorrectly in getUserStats!");
  }
}

module.exports.getUserStats = getUserStats;
