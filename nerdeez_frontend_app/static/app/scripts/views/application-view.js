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


