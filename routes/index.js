const express = require('express');
const router = express.Router();

module.exports = (app) => {

  require('./auth')(router);
  require('./providers/google-drive')(router);
  require('./providers/dropbox')(router);
  require('./providers/evernote')(router);
  require('./search')(router);

  return router;
};
