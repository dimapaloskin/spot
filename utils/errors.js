'use strict';

const processErrors = {
  google: (err) => {

    if (err.code === 401) {
      const newError = {};
      newError.message = 'auth_error';
      newError.code = 401;
      newError.account_id = err.account_id;
      newError.user = err.user;
      return newError;
    }

    return err;
  },

  dropbox: (err) => {

    if (err.message === 'Error in call to API function "files/search": The given OAuth 2 access token is malformed.') {
      const newError = {};
      newError.message = 'auth_error';
      newError.code = 401;
      newError.account_id = err.account_id;
      newError.user = err.user;
      return newError;
    }

    return err;
  },

  evernote: (err) => {

    if (err.code === 2) {
      const newError = {};
      newError.message = 'auth_error';
      newError.code = 401;
      newError.account_id = err.account_id;
      newError.user = err.user;
      return newError;
    }

    return err;
  },

  unknown: (err) => {

    const newError = {};
    newError.code = 500;
    newError.message = 'unknown error';
    return newError;
  }
};

module.exports = {

  createError(type, error) {

    if (typeof error === 'string') {
      error = {
        message: error,
        code: 0
      };
    }

    if (error && error.hasOwnProperty('type')) {
      return error;
    }

    if (type === 'google') {
      error = processErrors.google(error);
    }

    if (type === 'dropbox') {
      error = processErrors.dropbox(error);
    }

    if (type === 'evernote') {
      error = processErrors.evernote(error);
    }

    if (type === 'model' || type === 'api' && type === 'request') {
      console.log('Type: ' + type);
      console.log(error);
    }

    if (['dropbox', 'google', 'evernote'].indexOf(type) === -1) {
      error = processErrors.unknown(error);
    }

    return {
      type,
      error
    };
  }
};
