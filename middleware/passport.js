const LocalStrategy = require('passport-local').Strategy;

const crypt = require('./../utils/crypt');
const Account = require('./../models/account');

module.exports = (passport) => {

  passport.serializeUser((account, done) => {
    done(null, account._id);
  });

  passport.deserializeUser((id, done) => {
    Account.findById(id, done);
  });

  passport.use('login', new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'email',
    passwordField: 'password'
  }, (req, email, password, done) => {

    Account.findOne({ email: email }, (err, account) => {

      if (err) {
        return done(err);
      }

      if (!account) {
        return done(null, false, { message: 'User not found.' });
      }

      if (!account.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, account);
    });
  }));

  passport.use('signup', new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'email',
    passwordField: 'password'
  }, (req, email, password, done) => {

    Account.findOne({ email: email }, (err, account) => {

      if (err) {
        return done(err);
      }

      if (account) {
        return done(null, false, { message: 'Account already registered' });
      }

      Account.create({
        email: email,
        password: crypt.createHash(password)
      }, (err, account) => {

        done(err, account);
      });
    });
  }));

};
