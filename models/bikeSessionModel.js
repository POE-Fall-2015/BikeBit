var mongoose = require('mongoose');

var bikeSessionSchema = mongoose.Schema({
  createdAt: Date,
  distance: Number
});

module.exports.bikeSession = mongoose.model('bikeSession',bikeSessionSchema);
