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

  createAuthClient(token, callback) {

    const client = new Evernote.Client({
      token: token
    });

    return client;
  }
};
