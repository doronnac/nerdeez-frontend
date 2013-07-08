NerdeezFrontend.ApplicationController = Ember.Controller.extend({
  // Implement your controller here.
});

NerdeezFrontend.SearchuniversityController = Ember.ArrayController.extend({
	content: null,

  	// initial value
  	isExpanded: false,
  	
  	universityTitleContent: null,

  	expand: function() {
    	this.set('isExpanded', true);
  	},

  	contract: function() {
    	this.set('isExpanded', false);
  	},
  
	//@member {DS.Model}
	universityData: null,
	
	//@member {string}fullTitle
	description: null,
	
	searchResults: null,

	searchQuery: null,
	
	init: function() {
		this._super();
		
		this.set('universityTitleContent', NerdeezFrontend.University.find());
	},

	/**
	 * when the user clicks to update the university
	 * @param {function} success function
	 * @param {function} failed fundtion
	 */
	
	/*
	 * logging failure or success in server transaction
	 */
	logStatus: function(university, success, failure){
		university.on('didUpdate', function(object){
			success();
		});
		university.on('didDelete', function(object){
			success();
		});
		university.on('didCreate', function(object){
			success();
		});
		university.on('becameError', function(object){
			failure();
		});
	},
	
	updateUniversity: function(success, failure){
		console.log('updateUniversity');
		university = this.get('universityData');
		university.set('title', this.get('description'));
		university.transaction.commit();
		this.logStatus(university, success, failure);
	},
	
	deleteUniversity: function(success, failure){
		console.log('deleteUniversity');
		university = this.get('universityData');
		university.deleteRecord();
		university.transaction.commit();
		this.logStatus(university, success, failure);
	},
	
	createUniversity: function(success, failure){
		console.log('createUniversity');
		university = NerdeezFrontend.University.createRecord();
		university.set('title', this.get('description'));
		university.transaction.commit();
		this.logStatus(university, success, failure);
	},
	
	searchUniversity: function(){
		console.log('searchUniversity');

		this.set('searchResults', NerdeezFrontend.University.find({'search' : this.get('searchQuery')}));
	}.observes('searchQuery')
	
});