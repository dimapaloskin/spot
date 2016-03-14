import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel() {
    const auth = this.get('auth');

    const request = Ember.$.ajax({
      url: 'https://localhost:3000/api/v1/account/me',
      method: 'GET',
      xhrFields: {
        withCredentials: true
      }
    });

    return new Ember.RSVP.Promise((resolve) => {
      request.then(function (result) {

        auth.set('isAuth', true);
        auth.set('account', result.account);
        resolve();

      }, () => {

        auth.set('isAuth', false);
        auth.set('account', null);
        resolve();
      });
    });
  }
});
