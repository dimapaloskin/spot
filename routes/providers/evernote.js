'use strict';

const isAuth = require('./../../middleware/auth');
const config = require('./../../config');
const Account = require('./../../models/account');
const createError = require('./../../utils/errors').createError;
const evernoteProviderUtils = require('./../../providers/evernote');
const debug = require('debug')('router:evernote');


module.exports = (router) => {

  router.get('/providers/evernote/auth', (req, res, next) => {

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

  router.get('/providers/evernote/callback', (req, res, next) => {

    const client = evernoteProviderUtils.createClient();

    const evernoteConfig = req.session.evernote;

    client.getAccessToken(evernoteConfig.token, evernoteConfig.secret, req.query.oauth_verifier, (err, accessToken, accessSecret) => {

      res.json({
        status: true,
        accessToken,
        accessSecret
      });
    });

  });
};
