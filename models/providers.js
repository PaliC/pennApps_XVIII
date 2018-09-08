/* Module dependencies */
var mongoose = require('mongoose');

/* Module variables */
var ProviderSchema = mongoose.Schema({
  username: {
      type: String,
      required: true,
  },
  email: {
      type: String,
      required: true,
      unique: true
  },
  password:{
      type: String,
      required: true,
  },
  NPI: {
      type: Number, min:10, max:10,
      required: true,
  },
  created_on: {
      type: Date,
      default: Date.now,
  }   
});

var ProviderModel = mongoose.model('Provider', ProviderSchema);

module.exports = ProviderModel;