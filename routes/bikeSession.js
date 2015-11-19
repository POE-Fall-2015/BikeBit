var path = require('path');
var BikeSession = require('../models/bikeSessionModel.js').bikeSession;

var getSessions = function(req, res){
  //returns all bike sessions saved in database
  BikeSession.find({}).exec(function (err, bikeSessions) {
    if (err) {
      console.error("/routes/bikeSession.js GET error");
      console.log(err);
      res.status(500).send("Could not find bike sessions!");
    }
    else {
      res.status(200).send(bikeSessions); 
    }
  });
};

var postSession = function(req, res){
  //saves a new bike session to the data base.
  console.log(req.body);
  var newBikeSession = new BikeSession({
    createdAt: Date.now(),
    rotations: req.body.rotations
  });
  newBikeSession.save(function(err){
    if(err){
      console.error("/routes/bikeSession.js POST error");
      console.log(err);
      res.status(500).send("Could not post bike session!");
    } else {
      res.status(200).send(newBikeSession.toJSON());
    }
  });
};

module.exports.getSessions = getSessions;
module.exports.postSession = postSession;
