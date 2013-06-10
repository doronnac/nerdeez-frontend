var get = Ember.get, set = Ember.set;

DS.DjangoTastypieAdapter = DS.RESTAdapter.extend({
  /**
    Set this parameter if you are planning to do cross-site
    requests to the destination domain. Remember trailing slash
  */
  serverDomain: null,

  /**
    This is the default Tastypie namespace found in the documentation.
    You may change it if necessary when creating the adapter
  */
  namespace: "api/v1",

  /**
    Bulk commits are not supported at this time by the adapter.
    Changing this setting will not work
  */
  bulkCommit: false,

  /**
    Tastypie returns the next URL when all the elements of a type
    cannot be fetched inside a single request. Unless you override this
    feature in Tastypie, you don't need to change this value. Pagination
    will work out of the box for findAll requests
  */
  since: 'next',

  /**
    Serializer object to manage JSON transformations
  */
  serializer: DS.DjangoTastypieSerializer,

  init: function() {
    var serializer,
        namespace;

    this._super();

    namespace = get(this, 'namespace');
    Em.assert("tastypie namespace parameter is mandatory.", !!namespace);

    // Make the adapter available for the serializer
    serializer = get(this, 'serializer');
    set(serializer, 'adapter', this);
    set(serializer, 'namespace', namespace);
  },


  /**
    Create a record in the Django server. POST actions must
    be enabled in the Resource
  */
  createRecord: function(store, type, record) {
    var data,
        root = this.rootForType(type);

    data = record.serialize();
    xthis = this;
    this.ajax(this.buildURL(root), "POST", {
      data: data,
      success: function(json) {
        xthis.didCreateRecord(store, type, record, json);
      }
    });
  },

  /**
    Edit a record in the Django server. PUT actions must
    be enabled in the Resource
  */
  updateRecord: function(store, type, record) {
    var id,
        data;

    id = Em.get(record, 'id');
    root = this.rootForType(type);

    data = record.serialize();
    xthis = this;
    this.ajax(this.buildURL(root, id), "PUT", {
      data: data,
      success: function(json) {
        xthis.didSaveRecord(store, type, record, json);
      },
      /**
       * when ajax fails this function is invoked
       * 
       * @method
       * @param {jqXHR} jqXHR the ajax object
       * @param {String} textStatus
       * @param {String} errorThrown
       */
      error: function(json, jqXHR){
      		xthis.didError(store, type, record, jqXHR)
      }
    });
  },

  /**
    Delete a record in the Django server. DELETE actions
    must be enabled in the Resource
  */
  deleteRecord: function(store, type, record) {
    var id,
        root;

    id = get(record, 'id');
    root = this.rootForType(type);
    xthis = this;
    this.ajax(this.buildURL(root, id), "DELETE", {
    	data: null,
      	success: function(json) {
        	xthis.didDeleteRecord(store, type, record, json);
      	},
      /**
       * when ajax fails this function is invoked
       * 
       * @method
       * @param {jqXHR} jqXHR the ajax object
       * @param {String} textStatus
       * @param {String} errorThrown
       */
      error: function(json, jqXHR){
      		xthis.didError(store, type, record, jqXHR)
      }
    });
  },

  findMany: function(store, type, ids) {
    var url,
        root = this.rootForType(type);

    ids = this.serializeIds(ids);

    // FindMany array through subset of resources
    if (ids instanceof Array) {
      ids = "set/" + ids.join(";") + '/';
    }

    url = this.buildURL(root);
    url += ids;
    xthis = this;
    this.ajax(url, "GET", {
      success: function(json) {
        xthis.didFindMany(store, type, json);
      }
    });
  },

  buildURL: function(record, suffix) {
    var url = this._super(record, suffix);

    // Add the trailing slash to avoid setting requirement in Django.settings
    if (url.charAt(url.length -1) !== '/') {
      url += '/';
    }

    // Add the server domain if any
    if (!!this.serverDomain) {
      url = this.removeTrailingSlash(this.serverDomain) + url;
    }

    return url;
  },

  /**
     The actual nextUrl is being stored. The offset must be extracted from
     the string to do a new call.
     When there are remaining objects to be returned, Tastypie returns a
     `next` URL that in the meta header. Whenever there are no
     more objects to be returned, the `next` paramater value will be null.
     Instead of calculating the next `offset` each time, we store the nextUrl
     from which the offset will be extrated for the next request
  */
  sinceQuery: function(since) {
    var offsetParam,
        query;

    query = {};

    if (!!since) {
      offsetParam = since.match(/offset=(\d+)/);
      offsetParam = (!!offsetParam && !!offsetParam[1]) ? offsetParam[1] : null;
      query.offset = offsetParam;
    }

    return offsetParam ? query : null;
  },

  removeTrailingSlash: function(url) {
    if (url.charAt(url.length -1) === '/') {
      return url.slice(0, -1);
    }
    return url;
  },

  /**
    django-tastypie does not pluralize names for lists
  */
  pluralize: function(name) {
    return name;
  },
  
  findAll: function(store, type, record){
    var json = {}
    , root = this.rootForType(type)
    , plural = this.pluralize(root);
    xthis = this;
    this.ajax(this.buildURL(root), "GET", {
        data: null,
        success: function(json) {
            Ember.run(this, function(){
                xthis.didFindAll(store, type, json);
                
            });
        }
    });
  },
  
    findQuery: function(store, type, query, recordArray) {
        var json = {}
        , root = this.rootForType(type)
        , plural = this.pluralize(root);
        xthis = this;
        data = query;
        this.ajax(this.buildURL(root), "GET", {
            data: data,
            success: function(json) {
                Ember.run(this, function(){
                    xthis.didFindQuery(store, type, json, recordArray);
                });
            }
        });
    },
    
    find: function(store, type, id) {
        var json = {}
        , root = this.rootForType(type);
        xthis = this;
        this.ajax(this.buildURL(root, id), "GET", {
            success: function(json) {
                Ember.run(this, function(){
                    xthis.didFindRecord(store, type, json, id);
                });
            }
        });
    }
  
});
