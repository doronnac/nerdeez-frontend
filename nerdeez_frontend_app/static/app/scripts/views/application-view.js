//add general functions to all the views

/*************************************
* Begin nerdeez abstract view
*************************************/


/**
* all nerdeez viewz will extend this abstract
*/
NerdeezFrontend.NerdeezFrontendView = Ember.View.extend({
    
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
NerdeezFrontend.ApplicationView = NerdeezFrontend.NerdeezFrontendView.extend({
  	templateName: 'application'
});

NerdeezFrontend.HeaderView = NerdeezFrontend.NerdeezFrontendView.extend({
	templateName: 'header'
});

NerdeezFrontend.HomeView = NerdeezFrontend.NerdeezFrontendView.extend({
	templateName: 'home'
})

/**
* footer route is not used for now
* NerdeezFrontend.FooterView = NerdeezFrontend.NerdeezFrontendView.extend({
*	 templateName: 'footer'
*});
*/
NerdeezFrontend.SearchuniversityView = NerdeezFrontend.NerdeezFrontendView.extend({
	templateName: 'searchuniversity',
	
	//@property {Array} holds the content of the combo
	universityTitleContent: null,
	
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
		
		this.set('universityTitleContent', NerdeezFrontend.University.find());
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