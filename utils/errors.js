'use strict';

const processErrors = {
  google: (err) => {

    if (err.message === 'Invalid Credentials') {
      err.message = 'auth_error';
      return err;
    }

    return err;
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

    if (type === 'model' || type === 'api') {
      console.log('Type: ' + type);
      console.log(error);
    }

    if (type === 'google') {
      error = processErrors.google(error);
    }

    return {
      type,
      error
    };
  }
};
