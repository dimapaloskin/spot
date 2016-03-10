'use strict';

const async = require('async');
const isAuth = require('./../../middleware/auth');
const config = require('./../../config');
const Account = require('./../../models/account');
const createError = require('./../../utils/errors').createError;
const dropboxProviderUtils = require('./../../providers/dropbox');

module.exports = (router) => {

  router.get('/providers/dropbox/auth', (req, res, next) => {

    const url = dropboxProviderUtils.getAuthUrl();
    res.redirect(url);
  });

  router.get('/providers/dropbox/callback', (req, res, next) => {

    const code = req.query.code;

    async.auto({
      token: (callback) => {
        dropboxProviderUtils.getAccessToken(code, (err, token) => {

          if (err) {
            return callback(createError('dropbox', err));
          }

          callback(null, token)
        });
      },

      dropboxAccount: ['token', (callback, results) => {
        const client = dropboxProviderUtils.createClient(results.token.access_token);

        client.account((err, account) => {

          if (err) {
            return next(createError(err));
          }

          callback(null, account)
        });
      }],

      addProvider: ['dropboxAccount', (callback, results) => {

        const account = req.user;
        const providerData = {
          type: 'dropbox',
          account_id: results.dropboxAccount.uid,
          name_details: results.dropboxAccount.name_details,
          email: results.dropboxAccount.email,
          access_token: results.token.access_token,
          token: results.token
        };

        account.addProvider(providerData, (err, results) => {

          if (err) {
            return callback(createError('model', err));
          }

          callback(null, results);
        });
      }]
    }, (err, results) => {

      if (err) {
        return next(createError('api', err));
      }

      res.json({
        status: true
      });
    });
  });

  router.get('/providers/dropbox/search', (req, res, next) => {

    const q = req.query.q || '*';
    dropboxProviderUtils.search(req.user, q, (err, results) => {

      if (err) {
        return next(createError(err));
      }

      res.json(results);
    });
  });

};