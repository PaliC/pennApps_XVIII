/* Module dependencies */
var
  express = require('express'),
  passport = require('../config/passport'),
  utilities = require('../models/utilities');
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
          console.log('something' + req.session.passport);
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
        return res.redirect('dashboard', {user: req.user});
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