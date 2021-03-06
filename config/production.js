const config = {

  env: 'production',
  domain: 'spotsty.com',
  url: 'https://spotsty.com',

  server: {
    port: 3000,
    ssl: {
      path: './ssl/spotsty/'
    }
  },

  mongoose: {
    url: process.env.MONGODB_URL || 'mongodb://modulus:uWrNqrCXtu@ds011379.mlab.com:11379/spotsty'
  },

  sessions: {
    secret: 'blah-cat'
  },

  cookie: {
    domain: 'localhost:3000'
  },

  redis: {
    url: process.env.REDISCLOUD_URL || 'redis://spotsty:ZW3SAFfRTT@pub-redis-10516.us-east-1-4.4.ec2.garantiadata.com:10516'
  },

  cloud: {
    google: {
      scopes: ['https://www.googleapis.com/auth/drive.metadata.readonly', 'https://www.googleapis.com/auth/plus.me'],
      clientId: '89914776508-ss510o98a97na4od7hhdek1p495lm45u.apps.googleusercontent.com',
      clientSecret: 'ERvxGSH4ErcUz4p0hrsUVi_3',
      redirectUrl: 'https://spotsty.com/api/v1/providers/google/callback'
    },

    dropbox: {
      appKey: 'u5c9toxrlz5dor0',
      appSecret: 'u71gwig68wp9cex',
      redirectUrl: 'https://spotsty.com/api/v1/providers/dropbox/callback',
      authUrl: 'https://www.dropbox.com/1/oauth2/authorize',
      tokenUrl: 'https://api.dropboxapi.com/1/oauth2/token'
    }
  }
};

module.exports = config;
