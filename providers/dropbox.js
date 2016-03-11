'use strict';

const request = require('request');
const async = require('async');
const _ = require('lodash');
const config = require('./../config');
const createError = require('./../utils/errors').createError;

const apiUrls = {
  web: 'https://dropbox.com/home/',
  accountInfo: 'https://api.dropboxapi.com/1/account/info',
  search: 'https://api.dropboxapi.com/2/files/search'
};

module.exports = {

  getAuthUrl(callback) {

    const dbconf = config.cloud.dropbox;
    let url = dbconf.authUrl;
    url += `?client_id=${dbconf.appKey}`;
    url += `&redirect_uri=${dbconf.redirectUrl}`;
    url += '&response_type=code';

    return url;
  },

  getAccessToken(code, callback)  {

    const dbconf = config.cloud.dropbox;
    const options = {
      url: dbconf.tokenUrl,
      formData: {
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: dbconf.redirectUrl,
        client_id: dbconf.appKey,
        client_secret: dbconf.appSecret
      }
    };


    request.post(options, (err, response, body) => {

      body = JSON.parse(body);
      if (err) {
        return callback(createError('request', err));
      }

      if (body.hasOwnProperty('error')) {
        return callback(createError('dropbox', body));
      }

      callback(null, body);
    });
  },

  createClient(token, callback) {

    return {
      account: (callback) => {

        request.get({
          url: apiUrls.accountInfo,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }, (err, response, body) => {

          body = JSON.parse(body);
          if (err) {
            return callback(createError('request', err));
          }

          if (body.hasOwnProperty('error')) {
            return callback(createError('dropbox', body));
          }

          callback(null, body);
        });
      }

    };
  },

  search(account, q, count, callback) {

    if (typeof count === 'function') {
      callback = count;
      count = 10;
    }

    const providers = account.getProvidersByType('dropbox');
    async.map(providers, (provider, callback) => {

      const body = {
        query: q,
        path: '',
        max_results: 10
      };

      request.post({
        url: apiUrls.search,
        body: JSON.stringify(body),
        headers: {
          Authorization: `Bearer ${provider.access_token}`,
          'content-type': 'application/json'
        }
      }, (err, response, body) => {

        body = JSON.parse(body);
        if (err) {
          return callback(createError('request', err));
        }

        if (body.hasOwnProperty('error')) {
          return callback(createError('dropbox', body));
        }

        callback(null, {
          user: {
            email: provider.email,
            name_details: provider.name_details
          },
          results: body
        });
      });
    }, (err, results) => {

      if (err) {
        return callback(createError('dropbox', err));
      }

      callback(null, results);
    });
  },

  processResults(results) {

    const processedResults = _.map(results.results.matches, (item) => {

      const type = item.metadata['.tag'];
      let url = apiUrls.web;

      if (type === 'folder') {
        url += item.metadata.path_display;
      } else {
        
      }

      return {
        type: item.metadata['.tag'],
        name: item.metadata.name
      }
    });
  }
};
