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
  	},
  
	//@member {DS.Model}
	universityData: null,
	
	//@member {string}
	description: null,

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
	}
});