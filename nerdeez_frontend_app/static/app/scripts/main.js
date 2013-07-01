
/**********************************************************************
 * Application init
 *********************************************************************/

var NerdeezFrontend = Ember.Application.create({
	//server_url: SERVER_URL,
	server_url: 'https://nerdeez-backend-dev.herokuapp.com/', //TODO: Make URL an env var
	rootElement: '#wrap',
});

/*readyFunction = function() {
	console.log('readyFunction');
	Nerdeez. ,
}
Nerdeez.set('readyFunction', readyFunction);*/

/**********************************************************************
 * End application init
 *********************************************************************/