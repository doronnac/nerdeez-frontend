Nerdeez.ApplicationController = Ember.Controller.extend({
  // Implement your controller here.
});

Nerdeez.SearchuniversityController = Ember.ArrayController.extend({
	content: null,

  // initial value
  isExpanded: false,

  expand: function() {
    this.set('isExpanded', true);
  },

  contract: function() {
    this.set('isExpanded', false);
  }
});