'use strict';

const async = require('async');
const isAuth = require('./../../middleware/auth');
const config = require('./../../config');
const googleDriveProviderUtils = require('./../../providers/google-drive');
const Account = require('./../../models/account');
const createError = require('./../../utils/errors').createError;

module.exports = (router) => {

    router.get('/providers/google/auth', isAuth, (req, res, next) => {

      const client = googleDriveProviderUtils.createClient();
      const authUrl = client.generateAuthUrl({
        ccess_type: 'offline',
        scope: config.cloud.google.scopes
      });

      res.redirect(authUrl);
    });

    router.get('/providers/google/callback', isAuth, (req, res, next) => {

      const client = googleDriveProviderUtils.createClient();
      const code = req.query.code;

      async.auto({

        // get google access token
        token: (callback) => client.getToken(code, (err, token) => {

          if (err) {
            return callback(createError('google', err));
          }

          callback(null, token);
        }),

        // get google user information
        googleUser: ['token', (callback, results) => {

          client.setCredentials(results.token);

          googleDriveProviderUtils.getMe(client, (err, googleUser) => {

            if (err) {
              return callback(createError('google', err));
            }

            callback(null, googleUser);
          });
        }],

        // add/replace provider fro use
        addProvider: ['googleUser', (callback, results) => {

          const account = req.user;
          const providerData = {
            type: 'google',
            account_id: results.googleUser.id,
            account_name: results.googleUser.displayName,
            account_image_url: results.googleUser.image.url,
            access_token: results.token.access_token,
            token_type: results.token.token_type,
            token_type: results.token.token_type
          };

          account.addProvider(providerData, (err, result) => {

            if (err) {
              return callback(createError('model', err));
            }

            callback(null, result);
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

    router.get('/providers/google/search', isAuth, (req, res, next) => {

      const q = req.query.q || '*';
      googleDriveProviderUtils.search(req.user, q, (err, results) => {

        if (err) {
          return next(createError(err));
        }

        res.json(results);
      });
    });
};
