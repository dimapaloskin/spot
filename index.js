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
const cluster = require('cluster');
const cors = require('cors');
const debug = require('debug')('server');

const config = require('./config');
const cpusCount = config.env === 'development' ? 1 : require('os').cpus().length;

if (cluster.isMaster) {

  for (let i = 0; i < cpusCount; i++) {
    cluster.fork();
  }

  cluster.on('online', (worker) => {
    debug(`Worker ${worker.process.pid} is online`);
  });

  cluster.on('exit', (worker, code, signal) => {

    debug(`Worker ${worker.process.pid} is diad with code: ${cide}, and signal: ${signal}`);
    debug('Starting a new worker...');
    cluster.fork();
  });
} else {

  const app = express();
  mongoose.connect(config.mongoose.url);

  const Account = require('./models/account');

  app.use(cors());  
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

  if (config.env === 'development') {
    const options = {
        key: fs.readFileSync('./ssl/localhost/root.key'),
        cert: fs.readFileSync('./ssl/localhost/root.crt'),
        requestCert: false,
        rejectUnauthorized: false
    };

    const server = https.createServer(options, app).listen(process.env.PORT || config.server.port, () => {

      debug('Start listen https %d', process.env.PORT || config.server.port);
      debug(`Process: ${process.pid}`);
    });
  } else {
    app.listen(process.env.PORT || config.server.port, () => {

      debug('Start listen http %d', process.env.PORT || config.server.port);
      debug(`Process: ${process.pid}`);
    });
  }
}
