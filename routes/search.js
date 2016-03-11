'use strict';

const async = require('async');
const _ = require('lodash');
const googleDriveProviderUtils = require('./../providers/google-drive');
const dropboxProviderUtils = require('./../providers/dropbox');
const isAuth = require('./../middleware/auth');
const createError = require('./../utils/errors').createError;

module.exports = (router) => {

  router.get('/search', isAuth, (req, res, next) => {

    const q = req.query.q;

    async.auto({
      dropbox: (callback) => {

        dropboxProviderUtils.search(req.user, q, 5, (err, results) => {

          if (err) {
            return callback(createError('dropbox', err));
          }

          callback(null, results);
        });
      },

      googleDrive: (callback) => {

        googleDriveProviderUtils.search(req.user, q, 5, (err, results) => {

          if (err) {
            return callback(createError('google', err));
          }

          callback(null, results);
        });
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
