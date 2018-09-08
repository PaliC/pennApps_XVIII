/* Module dependencies */
var mongoose = require('mongoose');

var PatientSchema = mongoose.Schema({
  username: {
      type: String,
      required: true,
  },
  email: {
      type: String,
      required: true,
      unique: true,
  },
  password: {
      type: String,
      required: true,
  },
  address: {
      type: String,
  },
  city: {
      type: String,
  },
  state: {
      type: String,
  },
  phone: {
      type: String,
      trim: true,
  },
  created_on: {
      type: Date,
      default: Date.now,
  }
});

var PatientModel = mongoose.model('Patient', PatientSchema);

module.exports = PatientModel;