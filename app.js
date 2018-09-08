/* Module dependencies */
var express = require('express');
var logger = require('morgan');
var path = require('path');
var bParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var mongodbStore = require('connect-mongo')(session);

var cookieParser = require('cookie-parser');
/* Create app instance */
var app = express();

/* Module variables */
var config = require('./config/config');
var port = process.env.PORT || 3000;
var env = config.env;
var router = require('./routes/routes')
var dbURL = config.dbURL;
var db;

/* Module Settings and Config */
app.set('port', port);
app.set('env', env);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

mongoose.connect(dbURL);
db = mongoose.connection;

db.on('error', (err) => {
  console.error('There was a db connection error');
  return console.error(err.message);
});

db.once('connected', () => {
  return console.log('Successfully connected to ' + dbURL);
});

db.once('disconnected', () => {
  return console.log('Successfully disconnected from ' + dbURL);
});

/* Middleware */
app.use(logger('dev'));
app.use(bParser.json());
app.use(bParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  name: 'xpressBlu.sess', store: new mongodbStore({
    mongooseConnection: mongoose.connection,
  touchAfter: 24 * 3600}), secret: 'qwertyuiop123456789', resave: false,
  saveUninitialized: false, cookie: {maxAge: 1000 * 60 * 15}}));

app.use('/', router);

module.exports = app;
