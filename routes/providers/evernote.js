'use strict';

const async = require('async');
const isAuth = require('./../../middleware/auth');
const config = require('./../../config');
const Account = require('./../../models/account');
const createError = require('./../../utils/errors').createError;
const evernoteProviderUtils = require('./../../providers/evernote');
const debug = require('debug')('router:evernote');


module.exports = (router) => {

  router.get('/providers/evernote/auth', isAuth, (req, res, next) => {

    const client = evernoteProviderUtils.createClient();

    client.getRequestToken(config.cloud.evernote.redirectUrl, (err, token, secret, results) => {

      if (err) {
        return next(createError('evernote', err));
      }

      req.session.evernote = {
        token,
        secret
      };

      res.redirect(client.getAuthorizeUrl(token));
    });

  });

  router.get('/providers/evernote/callback', isAuth, (req, res, next) => {

    const evernoteConfig = req.session.evernote;

    async.auto({
      accessToken: (callback) => {

        const client = evernoteProviderUtils.createClient();

        client.getAccessToken(evernoteConfig.token, evernoteConfig.secret, req.query.oauth_verifier, (err, accessToken, accessSecret, results)=> {

          if (err) {
            return callback(createError('evernote', err));
          }

          callback(null, {
            token: accessToken,
            userId: results.edam_userId,
            urlPrefix: results.edam_webApiUrlPrefix,
            noteStoreUrl: results.edam_noteStoreUrl
          });

        });
      },

      evernoteUser: ['accessToken', (callback, results) => {

        const authClient = evernoteProviderUtils.createAuthClient(results.accessToken.token);
        const userStore = authClient.getUserStore();

        userStore.getUser((err, user) => {

          if (err) {
            return callback(createError('evernote', user));
          }

          callback(null, user);
        });
      }],

      addProvider: ['evernoteUser', (callback, results) => {

        const account = req.user;
        const providerData = {
          type: 'evernote',
          account_id: results.evernoteUser.id,
          username: results.evernoteUser.username,
          email: results.evernoteUser.email,
          access_token: results.accessToken.token,
          note_store_url: results.accessToken.noteStoreUrl,
          url_prefix: results.accessToken.urlPrefix
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

      res.redirect(config.url);
    });
  });

  router.get('/providers/evernote/search', (req, res, next) => {

    const q = req.query.q;
    const account = req.user;

    evernoteProviderUtils.search(account, q, (err, results) => {

      if (err) {
        return next(createError('evernote', err));
      }

      res.json(results);
    });
  });

};
