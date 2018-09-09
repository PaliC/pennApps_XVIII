/* Module dependencies */
var passport = require('passport');
var config = require('./config');
var Patient = require('../models/patients');
var User = require('../models/users');
var Provider = require('../models/providers');
var utilities = require('../models/utilities');

/* Module variables */
var host = config.host;
var errHandler = utilities.errHandler;
var LocalStrategy = require('passport-local').Strategy;

/**
*Configuration and Settings
*/
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    if(err) {
      console.error('There was an error accessing the records of' +
      ' user with id: ' + id);
      return console.log(err.message);
    }
    return done(null, user);
  })
});

passport.use('provider-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  npiField: 'npi',
  passReqToCallback: true
}, function(req, email, password, done) {
  process.nextTick(function() {
    Provider.findOne({email: email}, function(err, user) {
      if(err) {
        return errHandler(err);
        }
      if(user) {
        console.log('user already exists');
        return done(null, false, {errMsg: 'email already exists'});
      }
      else {
          var newProvider = new Provider();
          newProvider.username = req.body.username;
          newProvider.email = email;
          newProvider.password = newProvider.generateHash(password);
          newProvider.npi = Number(req.body.npi);
          newProvider.save(function(err) {
            if(err) {
              console.log(err);
              if(err.message == 'User validation failed') {
                console.log(err.message);
                return done(null, false, {errMsg: 'Please fill all fields'});
              }
              return errHandler(err);
              }
            console.log('New provider successfully created...',newProvider.username);
            console.log('email', email);
            console.log(newProvider);
            return done(null, newProvider);
          });
        }
    });
  });
}));

/* Local Strategy */
passport.use('patient-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  },
  function(req, email, password, done) {
    process.nextTick(function() {
      Patient.findOne({email: email}, function(err, user) {
        if(err) {
          return errHandler(err);
          }
        if(user) {
          console.log('user already exists');
          return done(null, false, {errMsg: 'email already exists'});
        }
        else {
            var newUser = new Patient();
            newUser.username = req.body.username;
            newUser.email = email;
            newUser.password = newUser.generateHash(password);
            newUser.save(function(err) {
              if(err) {
                console.log(err);
                if(err.message == 'User validation failed') {
                  console.log(err.message);
                  return done(null, false, {errMsg: 'Please fill all fields'});
                }
                return errHandler(err);
                }
              console.log('New patient successfully created...',newUser.username);
              console.log('email',email);
              console.log(newUser);
              return done(null, newUser);
            });
          }
      });
    });
}));
//---------------------------local login----------------------------------------
passport.use('patient-login', new LocalStrategy({
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true
  },
  function(req, email, password, done) {
    Patient.findOne({email: email}, function(err, user) {
      if(err) {
        return errHandler(err);
      }
      if(!user) {
        return done(null, false, {errMsg: 'User does not exist, please' +
        ' <a class="errMsg" href="/signup">signup</a>'});
      }
      if(!user.validPassword(user, password)) {
        return done(null, false, {errMsg: 'Invalid password try again'});
      }
      return done(null, user);
      });
}));

passport.use('provider-login', new LocalStrategy({
  usernameField : 'email',
  passwordField : 'password',
  passReqToCallback : true
},
function(req, email, password, done) {
  Provider.findOne({email: email}, function(err, user) {
    if(err) {
      return errHandler(err);
    }
    if(!user) {
      return done(null, false, {errMsg: 'User does not exist, please' +
      ' <a class="errMsg" href="/signup">signup</a>'});
    }
    if(!user.validPassword(user, password)) {
      return done(null, false, {errMsg: 'Invalid password try again'});
    }
    return done(null, user);
  });
}));
/**
*Export Module
*/
module.exports = passport;