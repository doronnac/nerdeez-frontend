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
	universityTitle: null,
	
	//@member {string}
	description: null,

	/**
	 * when the user clicks to update the university
	 * @param {function} success function
	 * @param {function} failed fundtion
	 */
	updateUniversity: function(success, failure){
		console.log('updateUniversity');
		university = this.get('universityTitle');
		university.set('title', this.get('description'));
		university.transaction.commit();
		university.one('didUpdate', function(object){
			console.log('didUpdate');
			if(!object.get('isError')){
				success();
				
			}
			else{
				failure();
			}
		})
	},
		
});