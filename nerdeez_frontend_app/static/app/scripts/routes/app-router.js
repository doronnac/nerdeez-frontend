
/**
* our state machine
*/
NerdeezFrontend.Router.map(function(match) {
    this.route('index', {path: '/'});
    this.route('home', {path: '/home'});
    this.route('searchuniversity', {path: '/search-university'});
});

/**
* all nerdeez routes will extend this object
* it will contain common route functions
*/
NerdeezFrontend.NerdeezFrontendRoute = Ember.Route.extend({

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
         /**
* footer is in base.html for now
* this.render('footer', {outlet: 'footer', into: 'application'});
*/
     }
});

NerdeezFrontend.IndexRoute = NerdeezFrontend.NerdeezFrontendRoute.extend({
	renderTemplate: function() {
		this._super();
		this.render('home', {outlet: 'home', into: 'application'});
	}
});

NerdeezFrontend.HomeRoute = NerdeezFrontend.NerdeezFrontendRoute.extend({
	renderTemplate: function() {
		this._super();
		this.render('home', {outlet: 'home', into: 'application'});
	}
});

NerdeezFrontend.SearchuniversityRoute = NerdeezFrontend.NerdeezFrontendRoute.extend({
	renderTemplate: function() {
		this._super();
		this.render('searchuniversity', {outlet: 'searchuniversity', into: 'application'});
	},
	model: function(param){
		return NerdeezFrontend.University.find();
	}
});