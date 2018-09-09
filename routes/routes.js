/* Module dependencies */
var
  express = require('express'),
  passport = require('../config/passport'),
  Patient = require('../models/patients'),
  Provider = require('../models/providers'),
  utilities = require('../models/utilities');
  statehelpers = require('../statehelpers');
  open = require('open');
//==============================================================================
/**
*Create router instance
*/
var router = express.Router();
//==============================================================================
/**
*Module Variables
*/
//needed to protect the '/dashboard' route
function isLoggedIn(req, res, next) {
  if(req.session.passport.user != undefined) {
    return next();
  }
  return res.redirect('/login');
}

var
  errHandler = utilities.errHandler,
  validationErr = utilities.validationErr,
  createUser = utilities.createUser,
  findUser = utilities.findUser,
  viewAllUsers = utilities.viewAllUsers,
  updateUser = utilities.updateUser,
  deleteUser = utilities.deleteUser;
//==============================================================================
/**
*Middleware
*/
router.use(passport.initialize());
router.use(passport.session());
//==============================================================================
/**
*Routes
*/
//---------------------------Test route-----------------------------------------
router.get('/test', function (req, res) {
  return res.send('<marquee><h1>Welcome to the test page</h1></marquee>');
});
//---------------------------App routes-----------------------------------------
router.get('/', function (req, res) {
  return res.render('pages/index', {user: req.user});
});

  router.get('^/patients/docusign/:id([0-9a-z]*)', function (req, res) {
    Patient.findById(req.params.id, (err, user) => {
      console.log(req.params.id);
      console.log(req.user.username);
      console.log(req.user.email);
      let promise = statehelpers(req.user.username, req.user.email, "Patient", user.email, "");
      console.log(promise);
      promise.then((value) => {
        console.log("THE OBJECT: " + JSON.stringify(value, null, 2));
        console.log("THE END");
        res.redirect(301, value);
      }).catch((value) => {
        console.log("ERROR OBJECT: " + JSON.stringify(value, null, 2));
        console.log("THE END");
      })
    })
  });

router.route('/patients/view')
  .get(function (req, res) {
    Patient.find({}, function(err, users) {
      var userMap = {};

      users.forEach(function(user) {
        userMap[user.username] = user
      });

      return res.render('pages/patients', {user: req.user, patients: userMap});
    })
  })
    .post(function (req, res, next) {
      Patient.findById(req.body.id, (err, user) => {
        console.log(req.body.id);
        console.log(user.username);
        console.log(user.email);
      });
    });
  
router.route('/patient/edit')
  .get(function (req, res) {
    return res.render('pages/edit', {provider: false,
      user: req.user});
  })
  .post(function (req, res, next) {
    let user = req.user;
    for (var key in req.body) {
      Patient.update(
        { user },
        { $set: 
          {
            key: req.body[key]
          }
        }
      )
    }
    return res.redirect('/dashboard')
  });

  router.route('/provider/edit')
  .get(function (req, res) {
    return res.render('pages/edit', {provider: true,
      user: req.user});
  })
  .post(function (req, res, next) {
    let user = req.user;
    for (var key in req.body) {
      Provider.update(
        { user },
        { $set: 
          {
            key: req.body[key]
          }
        }
      )
    }
    return res.redirect('/dashboard')
  });

router.route('/login/patient')
  .get(function (req, res) {
    return res.render('pages/login', {provider: false});
  })
  .post(function(req, res, next) {
    passport.authenticate('patient-login', function(err, user, info) {
      if (err) {
        return next(err); // will generate a 500 error
      }
      if (!user) {
        return res.status(409).render('pages/login', {provider: false, errMsg: info.errMsg});
      }
      req.login(user, function(err){
        if(err){
          console.error(err);
          return next(err);
        }
        req.session.save(function() {
          return res.redirect('/dashboard');
        });
      });
    })(req, res, next);
  });

  router.route('/login/provider')
  .get(function (req, res) {
    return res.render('pages/login', {provider: true});
  })
  .post(function(req, res, next) {
    passport.authenticate('provider-login', function(err, user, info) {
      if (err) {
        return next(err); // will generate a 500 error
      }
      if (!user) {
        return res.status(409).render('pages/login', {provider: true, errMsg: info.errMsg});
      }
      req.login(user, function(err){
        if(err){
          console.error(err);
          return next(err);
        }
        req.session.save(function() {
          return res.render('pages/dashboard', {user: req.user});
        });
      });
    })(req, res, next);
  });

router.route('/signup/provider')
  .get(function(req, res) {
    return res.render('pages/signup', {provider: true});
  })
  .post(function(req, res, next) {
    passport.authenticate('provider-signup', function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(409).render('pages/signup', {provider: true, errMsg: info.errMsg});
      }
      req.login(user, function(err) {
        if (err) {
          console.error(err);
          return next(err);
        }
        return res.redirect('/dashboard');
      });
    }) (req, res, next);
  });

router.route('/signup/patient')
  .get(function (req, res) {
    return res.render('pages/signup', {provider: false});
  })
  .post(function(req, res, next) {
    passport.authenticate('patient-signup', function(err, user, info) {
      if (err) {
        return next(err); // will generate a 500 error
      }
      if (!user) {
        return res.status(409).render('pages/signup', {provider: false, errMsg: info.errMsg});
      }
      req.login(user, function(err){
        if(err){
          console.error(err);
          return next(err);
        }
        return res.redirect('/dashboard');
      });
    })(req, res, next);
  });

router.route('/signup/pre')
  .get(function (req, res) {
    return res.render('pages/pre', {login: false});
  });

router.route('/login/pre')
  .get(function (req, res) {
    return res.render('pages/pre', {login: true});
  });

router.get('/dashboard', isLoggedIn, function (req, res) {
  return res.render('pages/dashboard', {
      user: req.user,
    });
});

router.get('/logout', function (req, res) {
  req.logout();
  req.session.destroy();
  return res.redirect('/');
});
//---------------------------API routes-----------------------------------------
router.get('/api/users', function (req, res) {
  return viewAllUsers(req, res);
});

router.route('/api/users/:email')
  .get(function (req, res) {
    return findUser(req, res);
  })
  .put(function (req, res) {
    return update(req, res);
  })
  .delete(function (req, res) {
    return deleteUser(req, res);
  });
//==============================================================================
/**
*Export Module
*/
module.exports = router;
//==============================================================================