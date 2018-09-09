/* Module dependencies */
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

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

PatientSchema.methods.generateHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

PatientSchema.methods.validPassword = (user, password) => {
    console.log(user);
    if (user.password != null) {
        console.log(password)
        console.log(user.password)
        return bcrypt.compareSync(password, user.password);
    } else {
        return false;
    }
};

var PatientModel = mongoose.model('Patient', PatientSchema);

module.exports = PatientModel;