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

function getMondayBefore(time) {
  //returns first monday before time specified in ms
  var date = new Date();
  date.setTime(time);
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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addDays(date, daysToAdd)
{
    var dat = new Date(date.getTime());
    dat.setDate(dat.getDate() + daysToAdd);
    return dat;
}

function getXLabels(monday){
  //returns date in format 09/08, 09/10, ... for the week, starting at monday
  //datetime object given
  var xlabels = [];
  for(var i = 0; i < 7 ; i++){
    var day = addDays(monday,i);
    var xlabel = day.getMonth()+1 +"/"+ day.getDate();
    xlabels.push(xlabel)
  }
  return xlabels;
}

var getGraphData = function(req, res){
  var graphTime = req.query.graphTime;
  var beginTime = getMondayBefore(graphTime);
  var endTime = addDays(beginTime,7);
  var xlabels = getXLabels(beginTime);
  //get user info so we know what goalRate and goalDistance are
  getUser(req, function(err, users){
    if(err){ res.status(500).send("Error getting users!"); console.log(err); }
    var goalRate = users[0].goalRate;
    var goalUnits = users[0].goalUnits;
    var goalDistance = users[0].goalDistance;
    var graphTitle;
    var goalLabel = "Goal: " + goalDistance + " " + goalUnits;
    if(goalRate === "week"){
      graphTitle = "Cumulative " + goalUnits + " biked the week of " + xlabels[0];
    } else if (goalRate === "day"){
      graphTitle = goalUnits + " biked the week of " + xlabels[0];
    } else {
      console.log("WARNING! goalRate is not valid!");
    }
    getTimeRangeSessions(beginTime,endTime,function(err, bikeSessions){
      if(err){ res.status(500).send("Error getting sessions!"); console.log(err); }
      var ys = [];
      var today = new Date();
      for(var i = 0; i < 7; i++){
        var begDate = addDays(beginTime,i);
        var endDate = addDays(beginTime,i+1);
        var filterDates = function(session){
          if(goalRate === "week"){
            //we want cumulative distance to display if goal is weekly
            return (session.createdAt < endDate);
          } else if (goalRate === "day"){
            return (session.createdAt < endDate) && (val.createdAt > begDate);
          } else {
            return null;
            console.log("WARNING! goalRate is not valid!");
          }
        }
        var filteredSessions = bikeSessions.filter(filterDates);
        var rotations = 0;
        filteredSessions.forEach(function(session){
          rotations += session.rotations;
        });
        var dist = rotationsToDistance(rotations,users[0]);
        if(begDate > today){
          ys.push(0);
        } else {
          ys.push(dist);
        }
      }
      var graphData = {
        xlabels: xlabels,
        ys: ys,
        goal: goalDistance,
        goalLabel: goalLabel,
        graphTitle: graphTitle,
      };
      res.status(200).send(graphData);
    });
  });
}

module.exports.getUserStats = getUserStats;
module.exports.getGraphData = getGraphData;
