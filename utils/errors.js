'use strict';

module.exports = {

  createError(type, error) {

    console.log(type, error);
    if (typeof error === 'string') {
      error = {
        message: error,
        code: 0
      };
    }

    if (error && error.hasOwnProperty('type')) {
      return error;
    }

    console.log('Type: ' + type);
    console.trace(error);

    return {
      type,
      error
    };
  }
};
