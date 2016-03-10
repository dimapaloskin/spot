'use strict';

const https = require('https');
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const mongoose = require('mongoose');
const passport = require('passport');
const debug = require('debug')('server');

const config = require('./config');

const app = express();
console.log(config.mongoose.url);
mongoose.connect(config.mongoose.url);

const Account = require('./models/account');

app.use(session({
  store: new RedisStore(config.redis),
  secret: config.sessions.secret,
  resave: true,
  saveUninitialized: true,
  rolling: true,
  cookie: {
    maxAge: null
  }
}));


app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(passport.initialize());
app.use(passport.session());
require('./middleware/passport')(passport);

const routes = require('./routes')(app);
app.use('/api/v1', routes);

app.use((err, req, res, next) => {

  res.status(500);
  res.json(err);
});

const options = {
    key: fs.readFileSync('./ssl/server.key'),
    cert: fs.readFileSync('./ssl/server.crt'),
    requestCert: false,
    rejectUnauthorized: false
};

/*const server = https.createServer(options, app).listen(config.server.port, () => {

  debug('start listen %d', config.server.port);
});*/

app.listen(config.server.port, () => {

  debug('start listen %d', config.server.port);
});
