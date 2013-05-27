
/**
* our state machine
*/
Nerdeez.Router.map(function(match) {
    this.route('index', {path: '/'});
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
    /*renderTemplate: function(){
        console.log('IndexRoute renderTemplate function');
        this.render('home');
    }*/
});


