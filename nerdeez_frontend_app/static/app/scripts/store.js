// Requires Ember-Data
// Static.Store = DS.Store.extend({
//   revision: 4,
//   adapter: DS.RESTAdapter.create()
// });

WorkerimClient.store = DS.Store.create({
    revision : 12,
    adapter : adapter
});