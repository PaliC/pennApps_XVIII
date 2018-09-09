/* Module dependencies */
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

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
  npi: {
      type: Number, 
      required: true,
  },
  created_on: {
      type: Date,
      default: Date.now,
  }   
});

/* Schema methods */
ProviderSchema.methods.generateHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

ProviderSchema.methods.validPassword = (user, password) => {
    console.log(user);
    if (user.password != null) {
        console.log(password)
        console.log(user.password)
        return bcrypt.compareSync(password, user.password);
    } else {
        return false;
    }
};

var ProviderModel = mongoose.model('Provider', ProviderSchema);

module.exports = ProviderModel;