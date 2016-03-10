'use strict';

const passport = require('passport');
const Account = require('../models/account');

const isAuth = require('./../middleware/auth');

module.exports = (router) => {

  router.post('/account/login', (req, res, next) => {

    passport.authenticate('login', (err, account, info) => {

      if (err) {
        return next(err);
      }

      if (!account) {
        return next(info);
      }

      req.logIn(account, (err) => {

        if (err) {
          return next(err);
        }

        res.json(account);
        next();
      })

    })(req, res, next);
  });

  router.get('/account/me', isAuth, (req, res, next) => {

    res.json({
      isAuth: req.isAuthenticated(),
      account: req.user
    });
  });

  router.get('/account/logout', (req, res, next) => {

    req.logout();
    res.json({
      status: true
    });
  });

  router.post('/account/signup', (req, res, next) => {

    passport.authenticate('signup', (err, account, info) => {

      res.json(account);
    })(req, res, next);
  });
};
