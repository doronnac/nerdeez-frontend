// Nerdeez.Router = Ember.Router.extend({
    // location: 'cache'
// });

/**
* our state machine
*/

Nerdeez.Router.map(function(match) {
    this.route('home', {path: '/'});
    this.route('about'); // {path: '/about'} added automatically
    this.route('contactus');
    this.route('searchuniversity', {path: '/searchuniversity/:params'});
});

/**
* all nerdeez routes will extend this object
* it will contain common route functions
*/
Nerdeez.NerdeezRoute = Ember.Route.extend({

    /**
	* will extract the url params
	* @param name String the name of the param to extract
	*/
    getURLParameter: function(name){
        return decodeURI(
            (RegExp(name + '=' + '(.+?)(&|$)').exec(window.location.href)||[,null])[1]
        );
    },
    
    /**
	* will grab the get params from the url and return a dictionary with the data
	* @returns {Object} dictionary object from the url
	*/
    getUrlParamsAsDisctionary: function(){
     var search = location.search.substring(1);
     return JSON.parse('{"' + decodeURI(search.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
    },
    
    /**
	* render common things to all the routes
	*/
     renderTemplate: function(){
         this._super();
         this.render('header', {outlet: 'header', into: 'application'});
     }     
});


/**
* render the application view
*/
Nerdeez.IndexRoute = Nerdeez.NerdeezRoute.extend({
    /**
	* this function will render the home view template
	*/
    renderTemplate: function(){
        console.log('IndexRoute renderTemplate function');
        this.render('home');
    }
});


/**
* render the route for the search universities page
*/
Nerdeez.searchuniversityRoute = Nerdeez.NerdeezRoute.extend({
	renderTemplate: function(){
		this._super();
		this.render('search', {outlet: 'searchcontroller', into: 'searchuniversity'});
	},

	/**
	* find the model for the content of the controller
	* @param {Object} param the dictionary contains the search query string
	* @returns {DS.Model} the content for the controller
	*/
	model: function(param){
		oParams = $.url(param.params).param();
		this.controllerFor('search').set('searchParams', oParams);
		return Nerdeez.Userprofile.find(oParams);
	},

	/**
	* sets up the controller for the search employees page
	* @param {Ember.ArrayController} the controller for the page
	* @param {string|DS.Model} contains the params to search for or the model
	*/
	setupController: function(controller, model){
		//fill the content of the controller
		this._super(controller, model);
		if(Ember.typeOf(model) === 'array'){
			oParams = $.url(model).param();
			this.controllerFor('search').set('searchParams', oParams);
			model = Nerdeez.Userprofile.find(oParams);
			}
		controller.set('content', model);
		//fill the ads of the controller
		controller.set('ads', Nerdeez.Userprofile.find({"is_featured": true, "is_frozen": false,"limit": 4}));
		//file the total count of the result
		controller.set('totalCount', model.content.get('totalCount'));
	}
});

Nerdeez.AboutRoute = Nerdeez.NerdeezRoute.extend({
    model: function(param) {
        console.log('about model function');
        return Nerdeez.Flatpage.find({"title": "about"});
    },
    setupController: function(controller, model){
     this._super(controller, model);
        controller.set('content', model);
    }
    
});

/**
* render the home view
*/
Nerdeez.HomeRoute = Nerdeez.NerdeezRoute.extend({
    /**
	* this function will render the home view
	*/
    renderTemplate: function(){
        console.log('HomeRoute renderTemplate function');
        this._super();
        this.render('search', { outlet: 'search', into: 'home' });
    }
});
