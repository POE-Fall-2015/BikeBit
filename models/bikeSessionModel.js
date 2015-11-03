var mongoose = require('mongoose');

var bikeSessionSchema = mongoose.Schema({
  createdAt: Date,
  rotations: Number
});

module.exports.bikeSession = mongoose.model('bikeSession',bikeSessionSchema);
