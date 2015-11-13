var path = require('path');
var User = require('../models/userModel.js').user;

var getSessions = function(req, res){
  //returns all bike sessions saved in database
  User.find({}).exec(function (err, users) {
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

var postSession = function(req, res){
  //saves a new bike session to the data base.
  var newUser = new User({
    username: req.body.username,
    goalDistance: req.body.goalDistance,
    goalRate: req.body.goalRate,
    wheelSize: req.body.wheelSize,
    goalUnits: req.body.goalUnits,
    override: req.body.override,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  newUser.save(function(err){
    if(err){
      console.error("/routes/user.js POST error");
      console.log(err);
      res.status(500).send("Could not post user!");
    } else {
      res.status(200).send(newUser.toJSON());
    }
  });
};

var putSession = function(req, res){
  //saves a new bike session to the data base.  
    User.find({}).exec(function (err, users) {
    if (err) {
      console.error("/routes/user.js GET error");
      console.log(err);
      res.status(500).send("Could not find users!");
    }
    else {
      user = users[0];
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
      }
    });
};

var patchSession = function(req, res){
  //saves a new bike session to the data base.  
    User.find({}).exec(function (err, users) {
    if (err) {
      console.error("/routes/user.js PATCH error");
      console.log(err);
      res.status(500).send("Could not find users!");
    }
    else {
      user = users[0];
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
      user.updatedAt = Date.now();
      user.save(function(err) {
            if (err) {
              console.error("/routes/user.js PATCH error");
              console.log(err);
              res.status(500).send("Could not PATCH user!");
            } else {
              res.status(200).send(user.toJSON());
            }
        });
      }
    });
};
                       

module.exports.getSessions = getSessions;
module.exports.postSession = postSession;
module.exports.putSession = putSession;
module.exports.patchSession = patchSession;


