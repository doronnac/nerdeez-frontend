// Requires Ember-Data
// Static.Store = DS.Store.extend({
//   revision: 4,
//   adapter: DS.RESTAdapter.create()
// });



/**
* define our tastypie adapter and serializer
*/
Adapter = Nerdeez.DjangoTastypieAdapter.extend({
    //backend server url
    serverDomain : Nerdeez.server_url,
    
    //hook for cross-domain communication
    wormhole: Nerdeez.Wormhole,
    
    //our serializer
    serializer: Nerdeez.DjangoTastypieSerializer.extend({
        
		/**
		* all the mappings will be declared here
		*/
    }),
    
    /**
	* override the ajax for cross domain communications
	*/
 /*   ajax: function (url, type, hash) {
        pass_data = hash.data;
        if (type.toLowerCase() == "post" || type.toLowerCase() == "put"){
            pass_data = JSON.stringify(hash.data);
        }
        if(Nerdeez.crossDomain == null)return;
        Nerdeez.crossDomain.ajax({url: url, type: type, data: pass_data, dataType: 'json', contentType: 'application/json', successFunction: hash.success, failFunction: hash.error});
    },
*/    
    /**
	* ajax error
	*/
    error: function(data){
        alert('Communication error with backend server');
    },
    
});

adapter = Adapter.create();


Nerdeez.store = DS.Store.create({
    revision : 12,
    adapter: adapter
});