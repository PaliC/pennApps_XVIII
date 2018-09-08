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

UserSchema.methods.validPassword = (user, password) => {
    console.log(user);
    if (user.password != null) {
        console.log(password)
        console.log(user.password)
        return bcrypt.compareSync(password, user.password);
    } else {
        return false;
    }
};

/* Create User Model */
var UserModel = mongoose.model('User', UserSchema);

/* Export Module */
module.exports = UserModel;