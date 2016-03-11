'use strict';

const googleAuth = require('google-auth-library');
const google = require('googleapis');
const _ = require('lodash');
const async = require('async');
const config = require('./../config');
const createError = require('./../utils/errors').createError;

module.exports = {

  createClient() {

    const auth = new googleAuth();
    const client = new auth.OAuth2(config.cloud.google.clientId, config.cloud.google.clientSecret, config.cloud.google.redirectUrl);
    return client;
  },

  getMe(client, callback) {
    const plus = google.plus('v1');
    plus.people.get({ userId: 'me', auth: client }, callback);
  },

  search(account, q, count, callback) {

    if (typeof count === 'function') {
      callback = count;
      count = 10;
    }

    const client = this.createClient();
    const providers = account.getProvidersByType('google');
    const service = google.drive('v3');


    async.map(providers, (provider, callback) => {

      client.setCredentials(provider);
      service.files.list({
        auth: client,
        pageSize: 10,
        fields: "nextPageToken, files(id, name, mimeType, webViewLink)",
        q: `name contains '${q}'`
      }, (err, results) => {

        if (err) {
          return callback(createError('google', err));
        }

        const providerUser = {
          account_name: provider.account_name,
          account_image_url: provider.account_image_url
        };

        callback(null, {
          provider: 'google',
          results: this.processResults(results, providerUser),
          user: providerUser,
          count: results.files.length
        });
      });
    }, (err, results) => {

      if (err) {
        return callback(createError('google', err));
      }

      callback(null, results);
    });
  },

  processResults(results, providerUser) {

    const processedResults = _.map(results.files, (item) => {

      return {
        id: item.id,
        name: item.name,
        type: item.mimeType,
        provider: {
          type: 'google',
          user: providerUser
        },
        urls: [{
          type: 'preview',
          url: item.webViewLink
        }]
      };
    });

    return processedResults;
  }

};
