'use strict';

const async = require('async');
const _ = require('lodash');
const googleDriveProviderUtils = require('./../providers/google-drive');
const dropboxProviderUtils = require('./../providers/dropbox');
const evernoteProviderUtils = require('./../providers/evernote');
const isAuth = require('./../middleware/auth');
const createError = require('./../utils/errors').createError;

module.exports = (router) => {

  router.get('/search', isAuth, (req, res, next) => {

    const q = req.query.q;

    async.auto({
      dropbox: (callback) => {

        if (req.user.getProvidersByType('dropbox')) {
          return dropboxProviderUtils.search(req.user, q, 5, (err, results) => {

            if (err) {
              return callback(null, createError('dropbox', err));
            }

            callback(null, results);
          });
        }

        callback(null, null);
      },

      google: (callback) => {

        if (req.user.getProvidersByType('google')) {
          return googleDriveProviderUtils.search(req.user, q, 5, (err, results) => {

            if (err) {
              return callback(null, createError('google', err));
            }

            callback(null, results);
          });
        }

        callback(null, null);
      },

      evernote: (callback) => {

        if (req.user.getProvidersByType('evernote')) {
          return evernoteProviderUtils.search(req.user, q, 5, (err, results) => {

            if (err) {
              return callback(null, createError('evernote', err));
            }

            callback(null, results);
          });
        }

        callback(null, null);
      }

    }, (err, results) => {

      if (err) {
        return next(createError('api', err));
      }

      const keys = _.keys(results);
      const resultsArray = _.map(keys, (key) => results[key]);
      const concatedResults = _.concat.apply(null, resultsArray);

      res.json(concatedResults);
    });

  });


};
