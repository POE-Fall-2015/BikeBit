var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  username: {type: String, index: { unique: true }},
  blockedDomains: [String],
  goalDistance: Number,
  goalRate: { type: String, lowercase: true },
  wheelSize: Number,
  goalUnits: { type: String, lowercase: true },
  override: Boolean,
  createdAt: Date,
  updatedAt: Date
});

module.exports.user = mongoose.model('user',userSchema);
