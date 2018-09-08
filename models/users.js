/* Module dependencies */
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

/* Module variables */
var UserSchema = mongoose.Schema({
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
    created_on: {
        type: Date,
        default: Date.now,
    }
});

/* Schema methods */
UserSchema.methods.generateHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.validPassword = (password) => {
    return bcrypt.compareSync(password, this.password);
};

/* Create User Model */
var UserModel = mongoose.model('User', UserSchema);

/* Export Module */
module.exports = UserModel;