//set the store for server communications
var adapter, Adapter, task;




/**
* define our tastypie adapter and serializer
*/
Adapter = DS.DjangoTastypieAdapter.extend({
    //backend server url
    serverDomain : Nerdeez.server_url,
    
    //our serializer
    serializer: DS.DjangoTastypieSerializer.extend({
        
        /**
* all the mappings will be declared here
*/
        init: function(){
            this._super();
            //example
         //this.mappings.set( 'Nerdeez.Userprofile', { fields: { embedded: 'load' } } );
            this.mappings.set( 'Nerdeez.Userprofile', {
                field: { embedded: 'load' },
                job: { embedded: 'load' },
                job_region: { embedded: 'load' },
                employment_bg:{embedded: 'load'},
                education:{embedded: 'load'},
                language: {embedded: 'load'},
                computer:{embedded: 'load'},
                gallery: {embedded: 'load'},
                job_type: {embedded: 'load'},
                recommendation: {embedded: 'load'}
            } );
            this.mappings.set( 'Nerdeez.Employmentbg', { field: { embedded: 'load' },job: { embedded: 'load' }} );
            this.mappings.set( 'Nerdeez.Region', { childs: { embedded: 'load' } } );
            this.mappings.set( 'Nerdeez.Field', { jobs: { embedded: 'load' } } );
        }
    }),
    
    /**
* override the ajax for cross domain communications
*/
    ajax: function (url, type, hash) {
        if(Nerdeez.get('auth') != null && Nerdeez.get('auth').get('isLoggedIn')){
            /*if (hash.data == null || hash.data == undefined){
hash.data = {};
}*/
            api_key = Nerdeez.get('auth').get('api_key');
            username = Nerdeez.get('auth').get('email');
            url = url + '?username=' + username + '&api_key=' + api_key;
        }
        pass_data = hash.data;
        if (type.toLowerCase() == "post" || type.toLowerCase() == "put"){
            pass_data = JSON.stringify(hash.data);
        }
        if(Nerdeez.crossDomain == null)return;
        Nerdeez.crossDomain.ajax({url: url, type: type, data: pass_data, dataType: 'json', contentType: 'application/json', successFunction: hash.success});
        $('#loadingball').css('display', 'block');
    },
    
    /**
* ajax error
*/
    error: function(data){
        $('#loadingball').css('display', 'none');
        alert('Communication error with backend server');
    },
    
    /**
* success error
*/
    success: function(data){
        $('#loadingball').css('display', 'none');
    }
});


adapter = Adapter.create();


Nerdeez.store = DS.Store.create({
    revision : 12,
    adapter : adapter
});

var serializer = adapter.get('serializer');

serializer.configure('Nerdeez.Job', {
alias: 'jobs'
});