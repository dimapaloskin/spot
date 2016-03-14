'use strict';

const path = require('path');
const request = require('request');
const async = require('async');
const _ = require('lodash');
const config = require('./../config');
const createError = require('./../utils/errors').createError;
const Evernote = require('evernote').Evernote;

module.exports = {

  createClient() {

    const client = new Evernote.Client({
      consumerKey: config.cloud.evernote.consumerKey,
      consumerSecret: config.cloud.evernote.consumerSecret
    });

    return client;
  },

  createAuthClient(token) {

    const client = new Evernote.Client({
      token: token
    });

    return client;
  },

  search(account, q, count, callback) {

    if (typeof count === 'function') {
      callback = count;
      count = 10;
    }

    const providers = account.getProvidersByType('evernote');

    if (!providers) {
      return callback(createError('evernote', {
        message: 'evernote providers not found'
      }));
    }

    async.map(providers, (provider, callback) => {
      const authClient = this.createAuthClient(provider.access_token);

      const noteStore = authClient.getNoteStore();
      const filter = new Evernote.NoteFilter({
        words: q
      });

      const resultSpec = new Evernote.NotesMetadataResultSpec({
        includeTitle: true,
        includeAttributes: true,
        includeNotebookGuid: true
      });

      noteStore.findNotesMetadata(config.cloud.evernote.developerToken, filter, 0, count, resultSpec, (err, results) => {

        if (err) {
          return callback(createError('evernote', err));
        }

        const providerUser = {
          username: provider.username,
          email: provider.email
        };

        callback(null, {
          provider: 'evernote',
          user: providerUser,
          results: this.processResults(results, providerUser, provider),
          count: results.notes.length
        });
      });
    }, (err, results) => {

      if (err) {
        return callback(createError('evernote', err));
      }

      callback(null, results);
    });

  },

  processResults(results, providerUser, provider) {

    console.log(provider);

    const processedResults = _.map(results.notes, (item) => {

      const previewUrl = `${provider.url_prefix}nl/${provider.account_id}/${item.guid}`;

      return {
        id: item.guid,
        title: item.title,
        provider: {
          type: 'evernote',
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
