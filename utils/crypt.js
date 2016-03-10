const bcrypt = require('bcrypt-nodejs');

module.exports = {
  createHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
  },

  validatePassword(account, password) {
    try {
      return bcrypt.compareSync(password, account.password);
    } catch(e) {
      return false;
    }
  }
};
