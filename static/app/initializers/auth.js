export function initialize(application) {
  const auth = Ember.Object.extend({
    isAuth: false,
    account: null
  });

  application.register('auth:main', auth);
  application.inject('route', 'auth', 'auth:main');
}

export default {
  name: 'auth',
  initialize
};
