//add general functions to all the views

/*************************************
* Begin nerdeez abstract view
*************************************/


/**
* all nerdeez viewz will extend this abstract
*/
Nerdeez.NerdeezView = Ember.View.extend({
    
    /**
	* will load the correct handlebars file
	*/
    templateForName: function(name, type) {
        if (!name) { return; }

        var templates = Em.get(this, 'templates'),
            template = Em.get(templates, name);

        if (!template) {
            $.ajax({
                url: STATIC_URL + 'app/scripts/templates/%@.html'.fmt(name),
                async: false
            }).success(function(data) {
                template = Ember.Handlebars.compile(data);
            });
        }

        if (!template) {
            throw new Em.Error('%@ - Unable to find %@ "%@".'.fmt(this, type, name));
        }

        return template;
    },
      
});

/**
* general application view
*/
Nerdeez.ApplicationView = Nerdeez.NerdeezView.extend({
  	templateName: 'application'
});

Nerdeez.HeaderView = Nerdeez.NerdeezView.extend({
	templateName: 'header'
});

Nerdeez.HomeView = Nerdeez.NerdeezView.extend({
	templateName: 'home'
})

/**
* footer route is not used for now
* Nerdeez.FooterView = Nerdeez.NerdeezView.extend({
*	 templateName: 'footer'
*});
*/
Nerdeez.SearchuniversityView = Nerdeez.NerdeezView.extend({
	templateName: 'searchuniversity',
	
	//@property {Array} holds the content of the combo
	universityTitleContent: null,
	
	//@property {Array} holds a search result
	searchA: null,
	
	//@property {function}
	success: function(){
			$('#update-status').text('Success!');
			$('#update-status').fadeIn('normal');	
	},
	//@property {function}
	failure: function(){
			$('#update-status').text('Failed!');
			$('#update-status').fadeIn('normal');
	},
	
  	/**
	 * constructor
	 */
	init: function(){
		this._super();
		
		this.set('universityTitleContent', Nerdeez.University.find());
		this.set('searchA', Nerdeez.University.find({title: "a"}));
	},
	
	/*
	 * monitor success or failure in server transactions
	 */
	
	updateUniversity: function(){
		this.controller.updateUniversity(this.get('success'), this.get('failure'));
	},
	
	deleteUniversity: function(){
		this.controller.deleteUniversity(this.get('success'), this.get('failure'))
	}
});