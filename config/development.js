const domain = 'localhost';

const config = {

  env: 'development',
  domain: 'localhot:3000',
  url: 'https://localhost:3000',

  server: {
    port: 3000,
    ssl: {
      path: './ssl/localhost/'
    }
  },

  mongoose: {
    url: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/spotsty'
  },

  sessions: {
    secret: 'blah-cat'
  },

  cookie: {
    domain: 'localhost:3000'
  },

  redis: {
    url: process.env.REDISCLOUD_URL || 'redis://localhost:6379'
  },

  cloud: {
    google: {
      scopes: ['https://www.googleapis.com/auth/drive.metadata.readonly', 'https://www.googleapis.com/auth/plus.me'],
      clientId: '89914776508-ss510o98a97na4od7hhdek1p495lm45u.apps.googleusercontent.com',
      clientSecret: 'ERvxGSH4ErcUz4p0hrsUVi_3',
      redirectUrl: 'https://localhost:3000/api/v1/providers/google/callback'
    },

    dropbox: {
      appKey: 'u5c9toxrlz5dor0',
      appSecret: 'u71gwig68wp9cex',
      redirectUrl: 'https://localhost:3000/api/v1/providers/dropbox/callback',
      authUrl: 'https://www.dropbox.com/1/oauth2/authorize',
      tokenUrl: 'https://api.dropboxapi.com/1/oauth2/token'
    },

    evernote: {
      consumerKey: 'dima183-3753',
      consumerSecret: '7f3c0e0a58b05238',
      redirectUrl: 'https://localhost:3000/api/v1/providers/evernote/callback',
      developerToken: 'S=s1:U=92377:E=15acd454975:C=15375941b90:P=1cd:A=en-devtoken:V=2:H=40582c08a235b00b94b6fad001ded41d'
    }
  }
};

module.exports = config;
