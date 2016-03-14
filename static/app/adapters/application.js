import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  namespace: 'api/v1',
  host: 'https://localhost:3000',
  ajax: function(url, method, hash) {
    hash.crossDomain = true;
    hash.xhrFields = { withCredentials: true };
    return this._super(url, method, hash);
  }
});
