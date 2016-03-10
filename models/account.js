const mongoose = require('mongoose');
const _ = require('lodash');
const Schema = mongoose.Schema;
const crypt = require('./../utils/crypt');

const schema = new Schema({

  email: String,
  password: String,
  providers: Array,
  createdAt: Date
});

schema.methods.validPassword = function(password) {

  const account = this;
  return crypt.validatePassword(account, password);
};

schema.methods.toJSON = function() {

  const account = this.toObject();
  delete account.__v;
  delete account.password;
  delete account.providers;
  return account;
};

schema.methods.addProvider = function(providerData, callback) {

  const providers = this.get('providers');

  const existingProvider = _.filter(providers, (provider) => {
    return provider.account_id === providerData.account_id;
  });

  if (existingProvider.length) {
    const rebuildedProviders = _.map(providers, (provider) => {

      if (provider.account_id === providerData.account_id) {
        return providerData;
      }

      return provider;
    });

    this.set('providers', rebuildedProviders);
  } else {
    providers.push(providerData);
    this.set('providers', providers);
  }


  return this.save(callback);
};

schema.methods.getProvidersByType = function(type) {

  const providers = this.get('providers');
  return _.filter(providers, (provider) => {
    return provider.type === type;
  });
};

module.exports = mongoose.model('Account', schema);
