var BikeSession = require('../models/bikeSessionModel.js').bikeSession;
var User = require('../models/userModel.js').user;

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

function rotationsToDistance(rotations,user){
  var measureWheelSize = 3; //inches
  var inchesPerMile = 63360.0;
  var inchesPerKm = 39370.0;
  var goalUnits = user.goalUnits
  if(goalUnits === "miles") {
    return rotations * measureWheelSize / inchesPerMile;
  } else if (goalUnits === "kilometers") {
    return rotations * measureWheelSize / inchesPerKm;
  } else {
    console.log("Err in rotationsToDistance, goalUnits not valid!");
    return null;
  }
}

var getUser = function(req, callback){
  //returns list of users w/username if specified in request,
  //returns list of all users otherwise.
  //calls callback(err,users)
  username = null;
  query_parms = {};
  if (req.body.username) {
    username = req.body.username;
  } else if (req.query.username) {
    username = req.query.username;
  }
  if (username) {
    query_parms["username"] = username;
  }
  User.find(query_parms).exec(function (err, users) {
    if (err) {
      console.error("/routes/user.js GET error");
      console.log(err);
      callback(err,[]);
    }
    else {
      callback(err, users);
    }
  });
};

var getUserStats = function(req, res){
  //given request with username specified, returns stats for that user
  //if no username is specified, returns stats for first user in database
  //returns object w/ keys canAccess, distToGo, progress, lifetimeTotal, 
  //and the user object itself
  //canAccess: whether user has met their set goals
  //distToGo: distance remaining until user meets set goals (negative if goal
  //surpassed)
  //progress: distance user has gone towards their goals
  //lifetimeTotal: total distance user has ever biked
  getUser(req, function(err, users){
    if(err){console.log("a"); res.status(500).send("Error getting sessions!"); console.log(err); }
    var goalRate = users[0].goalRate;
    var goalDistance = users[0].goalDistance;
    var wheelSize = users[0].wheelSize;
    var callback = function(err, progressRotations){
      if(err){console.log("b"); res.status(500).send("Error getting sessions!"); console.log(err); }
      var progressDistance = rotationsToDistance(progressRotations,users[0]);
      var canAccess = progressDistance >= goalDistance;
      var distToGo = goalDistance - progressDistance;
      getLifetimeRotations(function(err, lifetimeRotations){
        if(err){console.log("c"); res.status(500).send("Error getting sessions!"); console.log(err); }
        var stats = {"canAccess":canAccess, distToGo:distToGo, progress:progressDistance, 
          lifetimeTotal:rotationsToDistance(lifetimeRotations,users[0]), users:users[0]};
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
  });
}

module.exports.getUserStats = getUserStats;
