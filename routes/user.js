var path = require('path');
var User = require('../models/userModel.js').user;

var getUser = function(req, res){
  //returns list of users w/username if specified in request,
  //returns list of all users otherwise.
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
        res.status(500).send("Could not find users!");
      }
      else {
        res.status(200).send(users); 
      }
  });
};

function validateUser(res, user, callback){
  //validates that user object params are correctly
  //formatted if specified, and sends 400 invalid data err
  //if not, otherwise calls callback
  if(user.goalRate){
    if(user.goalRate != "week" && user.goalRate != "day"){
      res.status(400).send("Invalid user goalRate!");
      return;
    }
  }
  if(user.goalUnits){
    if(user.goalUnits != "miles" && user.goalUnits != "kilometers"){
      res.status(400).send("Invalid user goalUnits!");
      return;
    }
  }
  callback();
}

var postUser = function(req, res){
  //saves a new user to the data base.
  var newUser = new User({
    username: req.body.username,
    goalDistance: req.body.goalDistance,
    goalRate: req.body.goalRate,
    wheelSize: req.body.wheelSize,
    goalUnits: req.body.goalUnits,
    override: req.body.override,
    blockedDomains: req.body.blockedDomains,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  validateUser(res, newUser, function(){
    newUser.save(function(err){
      if(err){
        console.error("/routes/user.js POST error");
        console.log(err);
        res.status(500).send("Could not post user!");
      } else {
        res.status(200).send(newUser.toJSON());
      }
    });
  });
};

var putUser = function(req, res){
  //modifies a user in the data base.
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
        res.status(500).send("Could not find users!");
      }
      else {
        user = users[0];
        validateUser(res, user, function(){
          if (req.body.username) {
              user.username = req.body.username;
          }
          if (req.body.goalDistance) {
              user.goalDistance = req.body.goalDistance;
          }
          if (req.body.goalRate) {
              user.goalRate = req.body.goalRate;
          }
          if (req.body.wheelSize) {
              user.wheelSize = req.body.wheelSize;
          }
          if (req.body.goalUnits) {
              user.goalUnits = req.body.goalUnits;
          }
          if (req.body.override) {
              user.override = req.body.override;
          }
          if (req.body.blockedDomains) {
              user.blockedDomains = req.body.blockedDomains;
          }
          user.updatedAt = Date.now();
          user.save(function(err) {
            if (err) {
              console.error("/routes/user.js PUT error");
              console.log(err);
              res.status(500).send("Could not PUT user!");
            } else {
              res.status(200).send(user.toJSON());
            }
          });
        });
      }
    });
};

var deleteUser = function(req, res){
  //deletes user w/specified username
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
    User.find(query_parms).remove().exec(function (err) {
        var resp = {};
        if (err) {
          resp["success"] = true;
          var json_resp = JSON.stringify(resp);
          res.status(500).send(json_resp);
        }
        else {
          resp["success"] = false;
          var json_resp = JSON.stringify(resp);
          res.status(200).send(json_resp); 
        }
    });
};
                       

module.exports.getUser = getUser;
module.exports.postUser = postUser;
module.exports.putUser = putUser;
module.exports.patchUser = putUser;
module.exports.deleteUser = deleteUser;
