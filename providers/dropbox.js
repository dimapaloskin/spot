'use strict';

const path = require('path');
const request = require('request');
const async = require('async');
const _ = require('lodash');
const config = require('./../config');
const createError = require('./../utils/errors').createError;

const apiUrls = {
  web: 'https://dropbox.com/home',
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

      if (err) {
        return callback(createError('request', err));
      }

      if (body.hasOwnProperty('error')) {
        return callback(createError('dropbox', body));
      }

      try {
        body = JSON.parse(body);
      } catch(e) {
        return callback(createError('dropbox', {
          message: 'json parse error'
        }));
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
    if (!providers) {
      return callback(createError('api', {
        message: 'dropbox providers not found'
      }));
    }

    async.map(providers, (provider, callback) => {

      const body = {
        query: q,
        path: '',
        max_results: count
      };

      request.post({
        url: apiUrls.search,
        body: JSON.stringify(body),
        headers: {
          Authorization: `Bearer ${provider.access_token}`,
          'content-type': 'application/json'
        }
      }, (err, response, body) => {

        if (err) {
          return callback(null, createError('request', err));
        }

        try {
          body = JSON.parse(body);
        } catch(e) {
          return callback(null, createError('dropbox', {
            account_id: provider.account_id,
            message: body,
            user: provider.name_details
          }));
        }

        if (body.hasOwnProperty('error')) {
          return callback(null, createError('dropbox', body));
        }

        const providerUser = {
          email: provider.email,
          name_details: provider.name_details
        };

        callback(null, {
          provider: 'dropbox',
          user: providerUser,
          results: this.processResults(body, providerUser),
          count: body.matches.length
        });
      });
    }, (err, results) => {

      if (err) {
        return callback(createError('dropbox', err));
      }

      callback(null, results);
    });
  },

  processResults(results, providerUser) {

    const processedResults = _.map(results.matches, (item) => {

      const type = item.metadata['.tag'];
      let previewUrl = apiUrls.web;

      if (type === 'folder') {
        previewUrl += item.metadata.path_display;
      } else {
        const directory = path.dirname(item.metadata.path_display);
        previewUrl += directory;
        previewUrl += '?preview=' + item.metadata.name;
      }

      return {
        id: item.metadata.id,
        type: item.metadata['.tag'],
        name: item.metadata.name,
        provider: {
          type: 'dropbox',
          user: providerUser
        },
        urls: [{
          type: 'preview',
          url: previewUrl
        }]
      };
    });

    return processedResults;
  }
};
