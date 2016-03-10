const config = {

  server: {
    port: 3000
  },

  mongoose: {
    url: 'mongodb://localhost:27017/fstlr'
  },

  sessions: {
    secret: 'blah-cat'
  },

  cookie: {
    domain: 'localhost:3000'
  },

  redis: {
    host: 'localhost',
    port: '6379'
  },

  cloud: {
    google: {
      scopes: ['https://www.googleapis.com/auth/drive.metadata.readonly', 'https://www.googleapis.com/auth/plus.me'],
      clientId: '89914776508-ss510o98a97na4od7hhdek1p495lm45u.apps.googleusercontent.com',
      clientSecret: 'ERvxGSH4ErcUz4p0hrsUVi_3',
      redirectUrl: 'http://localhost:3000/providers/google/callback'
    },

    dropbox: {
      appKey: 'u5c9toxrlz5dor0',
      appSecret: 'u71gwig68wp9cex',
      redirectUrl: 'http://localhost:3000/providers/dropbox/callback',
      authUrl: 'https://www.dropbox.com/1/oauth2/authorize',
      tokenUrl: 'https://api.dropboxapi.com/1/oauth2/token'
    }
  }
};

module.exports = config;