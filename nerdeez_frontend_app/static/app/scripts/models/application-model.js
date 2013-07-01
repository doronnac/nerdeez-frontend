
// Requires Ember-Data
// Static.Application = DS.Model.extend({});

Nerdeez.NerdeezModel = DS.Model.extend();

// the model for the university title


Nerdeez.University = Nerdeez.NerdeezModel.extend({
	title: DS.attr('string'),
	//description: DS.attr('string'),
	
	fullTitle: function(){
		return this.get('title') + this.get('description');
	}.property('title', 'description')
});

//used for cross domain communication
// frontend
Nerdeez.Wormhole = Ember.Object.extend({
    init: function() {
        var target = "wormhole_iframe";
 
        // create the iframe
        this.iframe = $('<iframe id="' + target +
            '" name="' + target +
            '" src="' + Nerdeez.server_url +
            '" style="width: 0; height: 0; border: none; display: none;"></iframe>');
            $('body').append(this.iframe);
        // create a porthole.js proxy window to send and receive message from the vault iframe
        this.windowProxy = new Porthole.WindowProxy(Nerdeez.server_url, target);
 
        // handle messages based on their type
        var self = this;
        this.windowProxy.addEventListener(function(message) {
            var data = $.parseJSON(message.data);
            switch (data.type) {
                case "ready": return self.onReady(data);
                case "response": return self.onResponse(data);
                default: throw Error("unknown message type: " + data.type);
            }
        });
    },
    linked: false,
    pending: [],
    nextRequest: 1,
    deferreds: {},
    successFunction: {},
    failFunction: {},
    // make an ajax request through the porthole
    ajax: function(params) {
        var requestId = this.nextRequest;
        this.nextRequest += 1;
 
        var deferred = $.Deferred();
        this.deferreds[requestId] = deferred;
        this.successFunction[requestId] = params.successFunction;
        this.failFunction[requestId] = params.failFunction;
        var request = {requestId: requestId, params: params};
        if (this.linked) {
            this.sendRequest(request);
        } else {
            this.pending.push(request);
        }
        return deferred.promise();
    },
    // send a request by posting it to the hidden iframe
    sendRequest: function(request) {
        try{
            this.windowProxy.post(JSON.stringify(request));
        }
        catch(err){
            console.log(err);
        }
    },
 
    // handle the initial ready message indicating that the iframe has loaded successfully
    // we mark the link as being established and send any requests that are pending
    onReady: function(data) {
        this.linked = true;
        for (var i = 0; i < this.pending.length; i++) {
            this.sendRequest(this.pending[i]);
            //this.pending = this.pending.splice(i, 1);
            //this.sendRequest(this.pending.pop());
        }
        this.pending = [];
    },
    // handle responses to requests made through the wormhole
    onResponse: function(data) {
        var deferred = this.deferreds[data.requestId];
        delete this.deferreds[data.requestId];
        if (data.success) {
            deferred.resolve(data.data, data.textStatus);
            this.successFunction[data.requestId](data.data);
        } else {
            deferred.reject(data.textStatus, data.errorThrown);
            //alert('Communication error');
            this.failFunction[data.requestId](data.data, {status: 500, responseText: 'Server error'});
        }
    }
});

//object used fo rcross domain ajax calls
Nerdeez.crossDomain = Nerdeez.Wormhole.create();

