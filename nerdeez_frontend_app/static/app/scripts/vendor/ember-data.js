// Last commit: eb9098a (2013-05-20 14:17:16 -0700)


(function() {
var define, requireModule;

(function() {
  var registry = {}, seen = {};

  define = function(name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  requireModule = function(name) {
    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    var mod = registry[name],
        deps = mod.deps,
        callback = mod.callback,
        reified = [],
        exports;

    for (var i=0, l=deps.length; i<l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(requireModule(deps[i]));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;
  };
})();
(function() {
/**
  @module data
  @main data
*/

/**
  All Ember Data methods and functions are defined inside of this namespace. 

  @class DS
  @static
*/

window.DS = Ember.Namespace.create({
  /**
    Current API revision. See 
    [BREAKING_CHANGES.md](https://github.com/emberjs/data/blob/master/BREAKING_CHANGES.md) 
    for more information.

    @property CURRENT_API_REVISION
    @type Integer
  */
  CURRENT_API_REVISION: 12
});

})();



(function() {
var set = Ember.set;

/**
  This code registers an injection for Ember.Application.

  If an Ember.js developer defines a subclass of DS.Store on their application,
  this code will automatically instantiate it and make it available on the
  router.

  Additionally, after an application's controllers have been injected, they will
  each have the store made available to them.

  For example, imagine an Ember.js application with the following classes:

  App.Store = DS.Store.extend({
    adapter: 'App.MyCustomAdapter'
  });

  App.PostsController = Ember.ArrayController.extend({
    // ...
  });

  When the application is initialized, `App.Store` will automatically be
  instantiated, and the instance of `App.PostsController` will have its `store`
  property set to that instance.

  Note that this code will only be run if the `ember-application` package is
  loaded. If Ember Data is being used in an environment other than a
  typical application (e.g., node.js where only `ember-runtime` is available),
  this code will be ignored.
*/

Ember.onLoad('Ember.Application', function(Application) {
  Application.initializer({
    name: "store",

    initialize: function(container, application) {
      application.register('store:main', application.Store);

      // Eagerly generate the store so defaultStore is populated.
      // TODO: Do this in a finisher hook
      container.lookup('store:main');
    }
  });

  Application.initializer({
    name: "injectStore",

    initialize: function(container, application) {
      application.inject('controller', 'store', 'store:main');
      application.inject('route', 'store', 'store:main');
    }
  });
});

})();



(function() {
/**
 * Date.parse with progressive enhancement for ISO 8601 <https://github.com/csnover/js-iso8601>
 * Â© 2011 Colin Snover <http://zetafleet.com>
 * Released under MIT license.
 */

Ember.Date = Ember.Date || {};

var origParse = Date.parse, numericKeys = [ 1, 4, 5, 6, 7, 10, 11 ];
Ember.Date.parse = function (date) {
    var timestamp, struct, minutesOffset = 0;

    // ES5 Â§15.9.4.2 states that the string should attempt to be parsed as a Date Time String Format string
    // before falling back to any implementation-specific date parsing, so thatâ€™s what we do, even if native
    // implementations could be faster
    //              1 YYYY                2 MM       3 DD           4 HH    5 mm       6 ss        7 msec        8 Z 9 Â±    10 tzHH    11 tzmm
    if ((struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date))) {
        // avoid NaN timestamps caused by â€œundefinedâ€ values being passed to Date.UTC
        for (var i = 0, k; (k = numericKeys[i]); ++i) {
            struct[k] = +struct[k] || 0;
        }

        // allow undefined days and months
        struct[2] = (+struct[2] || 1) - 1;
        struct[3] = +struct[3] || 1;

        if (struct[8] !== 'Z' && struct[9] !== undefined) {
            minutesOffset = struct[10] * 60 + struct[11];

            if (struct[9] === '+') {
                minutesOffset = 0 - minutesOffset;
            }
        }

        timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
    }
    else {
        timestamp = origParse ? origParse(date) : NaN;
    }

    return timestamp;
};

if (Ember.EXTEND_PROTOTYPES === true || Ember.EXTEND_PROTOTYPES.Date) {
  Date.parse = Ember.Date.parse;
}

})();



(function() {

})();



(function() {
var Evented = Ember.Evented,              // ember-runtime/mixins/evented
    Deferred = Ember.DeferredMixin,       // ember-runtime/mixins/evented
    run = Ember.run,                      // ember-metal/run-loop
    get = Ember.get;                      // ember-metal/accessors

var LoadPromise = Ember.Mixin.create(Evented, Deferred, {
  init: function() {
    this._super.apply(this, arguments);

    this.one('didLoad', this, function() {
      run(this, 'resolve', this);
    });

    this.one('becameError', this, function() {
      run(this, 'reject', this);
    });

    if (get(this, 'isLoaded')) {
      this.trigger('didLoad');
    }
  }
});

DS.LoadPromise = LoadPromise;

})();



(function() {
/**
*/

var get = Ember.get, set = Ember.set;

var LoadPromise = DS.LoadPromise; // system/mixins/load_promise

/**
  A record array is an array that contains records of a certain type. The record
  array materializes records as needed when they are retrieved for the first
  time. You should not create record arrays yourself. Instead, an instance of
  DS.RecordArray or its subclasses will be returned by your application's store
  in response to queries.

  @module data
  @submodule data-record-array
  @main data-record-array

  @class RecordArray
  @namespace DS
  @extends Ember.ArrayProxy
  @uses Ember.Evented
  @uses DS.LoadPromise
*/

DS.RecordArray = Ember.ArrayProxy.extend(LoadPromise, {
  /**
    The model type contained by this record array.

    @type DS.Model
  */
  type: null,

  // The array of client ids backing the record array. When a
  // record is requested from the record array, the record
  // for the client id at the same index is materialized, if
  // necessary, by the store.
  content: null,

  isLoaded: false,
  isUpdating: false,

  // The store that created this record array.
  store: null,

  objectAtContent: function(index) {
    var content = get(this, 'content'),
        reference = content.objectAt(index),
        store = get(this, 'store');

    if (reference) {
      return store.recordForReference(reference);
    }
  },

  materializedObjectAt: function(index) {
    var reference = get(this, 'content').objectAt(index);
    if (!reference) { return; }

    if (get(this, 'store').recordIsMaterialized(reference)) {
      return this.objectAt(index);
    }
  },

  update: function() {
    if (get(this, 'isUpdating')) { return; }

    var store = get(this, 'store'),
        type = get(this, 'type');

    store.fetchAll(type, this);
  },

  addReference: function(reference) {
    get(this, 'content').addObject(reference);
  },

  removeReference: function(reference) {
    get(this, 'content').removeObject(reference);
  }
});

})();



(function() {
/**
  @module data
  @submodule data-record-array
*/

var get = Ember.get;

/**
  @class FilteredRecordArray
  @namespace DS
  @extends DS.RecordArray
  @constructor
*/
DS.FilteredRecordArray = DS.RecordArray.extend({
  filterFunction: null,
  isLoaded: true,

  replace: function() {
    var type = get(this, 'type').toString();
    throw new Error("The result of a client-side filter (on " + type + ") is immutable.");
  },

  updateFilter: Ember.observer(function() {
    var manager = get(this, 'manager');
    manager.updateFilter(this, get(this, 'type'), get(this, 'filterFunction'));
  }, 'filterFunction')
});

})();



(function() {
/**
  @module data
  @submodule data-record-array
*/

var get = Ember.get, set = Ember.set;

/**
  @class AdapterPopulatedRecordArray
  @namespace DS
  @extends DS.RecordArray
  @constructor
*/
DS.AdapterPopulatedRecordArray = DS.RecordArray.extend({
  query: null,

  replace: function() {
    var type = get(this, 'type').toString();
    throw new Error("The result of a server query (on " + type + ") is immutable.");
  },

  load: function(references) {
    this.setProperties({
      content: Ember.A(references),
      isLoaded: true
    });

    // TODO: does triggering didLoad event should be the last action of the runLoop?
    Ember.run.once(this, 'trigger', 'didLoad');
  }
});

})();



(function() {
/**
  @module data
  @submodule data-record-array
*/

var get = Ember.get, set = Ember.set;

/**
  A ManyArray is a RecordArray that represents the contents of a has-many
  relationship.

  The ManyArray is instantiated lazily the first time the relationship is
  requested.

  ### Inverses

  Often, the relationships in Ember Data applications will have
  an inverse. For example, imagine the following models are
  defined:

      App.Post = DS.Model.extend({
        comments: DS.hasMany('App.Comment')
      });

      App.Comment = DS.Model.extend({
        post: DS.belongsTo('App.Post')
      });

  If you created a new instance of `App.Post` and added
  a `App.Comment` record to its `comments` has-many
  relationship, you would expect the comment's `post`
  property to be set to the post that contained
  the has-many.

  We call the record to which a relationship belongs the
  relationship's _owner_.

  @class ManyArray
  @namespace DS
  @extends DS.RecordArray
  @constructor
*/
DS.ManyArray = DS.RecordArray.extend({
  init: function() {
    this._super.apply(this, arguments);
    this._changesToSync = Ember.OrderedSet.create();
  },

  /**
    @private

    The record to which this relationship belongs.

    @property {DS.Model}
  */
  owner: null,

  /**
    @private

    `true` if the relationship is polymorphic, `false` otherwise.

    @property {Boolean}
  */
  isPolymorphic: false,

  // LOADING STATE

  isLoaded: false,

  loadingRecordsCount: function(count) {
    this.loadingRecordsCount = count;
  },

  loadedRecord: function() {
    this.loadingRecordsCount--;
    if (this.loadingRecordsCount === 0) {
      set(this, 'isLoaded', true);
      this.trigger('didLoad');
    }
  },

  fetch: function() {
    var references = get(this, 'content'),
        store = get(this, 'store'),
        owner = get(this, 'owner');

    store.fetchUnloadedReferences(references, owner);
  },

  // Overrides Ember.Array's replace method to implement
  replaceContent: function(index, removed, added) {
    // Map the array of record objects into an array of  client ids.
    added = added.map(function(record) {
      Ember.assert("You can only add records of " + (get(this, 'type') && get(this, 'type').toString()) + " to this relationship.", !get(this, 'type') || (get(this, 'type').detectInstance(record)) );
      return get(record, '_reference');
    }, this);

    this._super(index, removed, added);
  },

  arrangedContentDidChange: function() {
    this.fetch();
  },

  arrayContentWillChange: function(index, removed, added) {
    var owner = get(this, 'owner'),
        name = get(this, 'name');

    if (!owner._suspendedRelationships) {
      // This code is the first half of code that continues inside
      // of arrayContentDidChange. It gets or creates a change from
      // the child object, adds the current owner as the old
      // parent if this is the first time the object was removed
      // from a ManyArray, and sets `newParent` to null.
      //
      // Later, if the object is added to another ManyArray,
      // the `arrayContentDidChange` will set `newParent` on
      // the change.
      for (var i=index; i<index+removed; i++) {
        var reference = get(this, 'content').objectAt(i);

        var change = DS.RelationshipChange.createChange(owner.get('_reference'), reference, get(this, 'store'), {
          parentType: owner.constructor,
          changeType: "remove",
          kind: "hasMany",
          key: name
        });

        this._changesToSync.add(change);
      }
    }

    return this._super.apply(this, arguments);
  },

  arrayContentDidChange: function(index, removed, added) {
    this._super.apply(this, arguments);

    var owner = get(this, 'owner'),
        name = get(this, 'name'),
        store = get(this, 'store');

    if (!owner._suspendedRelationships) {
      // This code is the second half of code that started in
      // `arrayContentWillChange`. It gets or creates a change
      // from the child object, and adds the current owner as
      // the new parent.
      for (var i=index; i<index+added; i++) {
        var reference = get(this, 'content').objectAt(i);

        var change = DS.RelationshipChange.createChange(owner.get('_reference'), reference, store, {
          parentType: owner.constructor,
          changeType: "add",
          kind:"hasMany",
          key: name
        });
        change.hasManyName = name;

        this._changesToSync.add(change);
      }

      // We wait until the array has finished being
      // mutated before syncing the OneToManyChanges created
      // in arrayContentWillChange, so that the array
      // membership test in the sync() logic operates
      // on the final results.
      this._changesToSync.forEach(function(change) {
        change.sync();
      });
      DS.OneToManyChange.ensureSameTransaction(this._changesToSync, store);
      this._changesToSync.clear();
    }
  },

  // Create a child record within the owner
  createRecord: function(hash, transaction) {
    var owner = get(this, 'owner'),
        store = get(owner, 'store'),
        type = get(this, 'type'),
        record;

    Ember.assert("You can not create records of " + (get(this, 'type') && get(this, 'type').toString()) + " on this polymorphic relationship.", !get(this, 'isPolymorphic'));

    transaction = transaction || get(owner, 'transaction');

    record = store.createRecord.call(store, type, hash, transaction);
    this.pushObject(record);

    return record;
  }

});

})();



(function() {
/**
  @module data
  @submodule data-record-array
*/

})();



(function() {
var get = Ember.get, set = Ember.set, forEach = Ember.EnumerableUtils.forEach;

/**
  @module data
  @submodule data-transaction
*/

/**
  A transaction allows you to collect multiple records into a unit of work
  that can be committed or rolled back as a group.

  For example, if a record has local modifications that have not yet
  been saved, calling `commit()` on its transaction will cause those
  modifications to be sent to the adapter to be saved. Calling
  `rollback()` on its transaction would cause all of the modifications to
  be discarded and the record to return to the last known state before
  changes were made.

  If a newly created record's transaction is rolled back, it will
  immediately transition to the deleted state.

  If you do not explicitly create a transaction, a record is assigned to
  an implicit transaction called the default transaction. In these cases,
  you can treat your application's instance of `DS.Store` as a transaction
  and call the `commit()` and `rollback()` methods on the store itself.

  Once a record has been successfully committed or rolled back, it will
  be moved back to the implicit transaction. Because it will now be in
  a clean state, it can be moved to a new transaction if you wish.

  ### Creating a Transaction

  To create a new transaction, call the `transaction()` method of your
  application's `DS.Store` instance:

      var transaction = App.store.transaction();

  This will return a new instance of `DS.Transaction` with no records
  yet assigned to it.

  ### Adding Existing Records

  Add records to a transaction using the `add()` method:

      record = App.store.find(App.Person, 1);
      transaction.add(record);

  Note that only records whose `isDirty` flag is `false` may be added
  to a transaction. Once modifications to a record have been made
  (its `isDirty` flag is `true`), it is not longer able to be added to
  a transaction.

  ### Creating New Records

  Because newly created records are dirty from the time they are created,
  and because dirty records can not be added to a transaction, you must
  use the `createRecord()` method to assign new records to a transaction.

  For example, instead of this:

    var transaction = store.transaction();
    var person = App.Person.createRecord({ name: "Steve" });

    // won't work because person is dirty
    transaction.add(person);

  Call `createRecord()` on the transaction directly:

    var transaction = store.transaction();
    transaction.createRecord(App.Person, { name: "Steve" });

  ### Asynchronous Commits

  Typically, all of the records in a transaction will be committed
  together. However, new records that have a dependency on other new
  records need to wait for their parent record to be saved and assigned an
  ID. In that case, the child record will continue to live in the
  transaction until its parent is saved, at which time the transaction will
  attempt to commit again.

  For this reason, you should not re-use transactions once you have committed
  them. Always make a new transaction and move the desired records to it before
  calling commit.
*/

DS.Transaction = Ember.Object.extend({
  /**
    @private

    Creates the bucket data structure used to segregate records by
    type.
  */
  init: function() {
    set(this, 'records', Ember.OrderedSet.create());
  },

  /**
    Creates a new record of the given type and assigns it to the transaction
    on which the method was called.

    This is useful as only clean records can be added to a transaction and
    new records created using other methods immediately become dirty.

    @param {DS.Model} type the model type to create
    @param {Object} hash the data hash to assign the new record
  */
  createRecord: function(type, hash) {
    var store = get(this, 'store');

    return store.createRecord(type, hash, this);
  },

  isEqualOrDefault: function(other) {
    if (this === other || other === get(this, 'store.defaultTransaction')) {
      return true;
    }
  },

  isDefault: Ember.computed(function() {
    return this === get(this, 'store.defaultTransaction');
  }).volatile(),

  /**
    Adds an existing record to this transaction. Only records without
    modificiations (i.e., records whose `isDirty` property is `false`)
    can be added to a transaction.

    @param {DS.Model} record the record to add to the transaction
  */
  add: function(record) {
    Ember.assert("You must pass a record into transaction.add()", record instanceof DS.Model);

    var store = get(this, 'store');
    var adapter = get(store, '_adapter');
    var serializer = get(adapter, 'serializer');
    serializer.eachEmbeddedRecord(record, function(embeddedRecord, embeddedType) {
      if (embeddedType === 'load') { return; }

      this.add(embeddedRecord);
    }, this);

    this.adoptRecord(record);
  },

  relationships: Ember.computed(function() {
    var relationships = Ember.OrderedSet.create(),
        records = get(this, 'records'),
        store = get(this, 'store');

    records.forEach(function(record) {
      var reference = get(record, '_reference');
      var changes = store.relationshipChangesFor(reference);
      for(var i = 0; i < changes.length; i++) {
        relationships.add(changes[i]);
      }
    });

    return relationships;
  }).volatile(),

  commitDetails: Ember.computed(function() {
    var commitDetails = Ember.MapWithDefault.create({
      defaultValue: function() {
        return {
          created: Ember.OrderedSet.create(),
          updated: Ember.OrderedSet.create(),
          deleted: Ember.OrderedSet.create()
        };
      }
    });

    var records = get(this, 'records'),
        store = get(this, 'store');

    records.forEach(function(record) {
      if(!get(record, 'isDirty')) return;
      record.send('willCommit');
      var adapter = store.adapterForType(record.constructor);
      commitDetails.get(adapter)[get(record, 'dirtyType')].add(record);
    });

    return commitDetails;
  }).volatile(),

  /**
    Commits the transaction, which causes all of the modified records that
    belong to the transaction to be sent to the adapter to be saved.

    Once you call `commit()` on a transaction, you should not re-use it.

    When a record is saved, it will be removed from this transaction and
    moved back to the store's default transaction.
  */
  commit: function() {
    var store = get(this, 'store');

    if (get(this, 'isDefault')) {
      set(store, 'defaultTransaction', store.transaction());
    }

    this.removeCleanRecords();

    var commitDetails = get(this, 'commitDetails'),
        relationships = get(this, 'relationships');

    commitDetails.forEach(function(adapter, commitDetails) {
      Ember.assert("You tried to commit records but you have no adapter", adapter);
      Ember.assert("You tried to commit records but your adapter does not implement `commit`", adapter.commit);

      adapter.commit(store, commitDetails);
    });

    // Once we've committed the transaction, there is no need to
    // keep the OneToManyChanges around. Destroy them so they
    // can be garbage collected.
    relationships.forEach(function(relationship) {
      relationship.destroy();
    });
  },

  /**
    Rolling back a transaction resets the records that belong to
    that transaction.

    Updated records have their properties reset to the last known
    value from the persistence layer. Deleted records are reverted
    to a clean, non-deleted state. Newly created records immediately
    become deleted, and are not sent to the adapter to be persisted.

    After the transaction is rolled back, any records that belong
    to it will return to the store's default transaction, and the
    current transaction should not be used again.
  */
  rollback: function() {
    var store = get(this, 'store');

    // Destroy all relationship changes and compute
    // all references affected
    var references = Ember.OrderedSet.create();
    var relationships = get(this, 'relationships');
    relationships.forEach(function(r) {
      references.add(r.firstRecordReference);
      references.add(r.secondRecordReference);
      r.destroy();
    });

    var records = get(this, 'records');
    records.forEach(function(record) {
      if (!record.get('isDirty')) return;
      record.send('rollback');
    });

    // Now that all records in the transaction are guaranteed to be
    // clean, migrate them all to the store's default transaction.
    this.removeCleanRecords();

    // Remaining associated references are not part of the transaction, but
    // can still have hasMany's which have not been reloaded
    references.forEach(function(r) {
      if (r && r.record) {
        var record = r.record;
        record.suspendRelationshipObservers(function() {
          record.reloadHasManys();
        });
      }
    }, this);
  },

  /**
    @private

    Removes a record from this transaction and back to the store's
    default transaction.

    Note: This method is private for now, but should probably be exposed
    in the future once we have stricter error checking (for example, in the
    case of the record being dirty).

    @param {DS.Model} record
  */
  remove: function(record) {
    var defaultTransaction = get(this, 'store.defaultTransaction');
    defaultTransaction.adoptRecord(record);
  },

  /**
    @private

    Removes all of the records in the transaction's clean bucket.
  */
  removeCleanRecords: function() {
    var records = get(this, 'records');
    records.forEach(function(record) {
      if(!record.get('isDirty')) {
        this.remove(record);
      }
    }, this); 
  },

  /**
    @private

    This method moves a record into a different transaction without the normal
    checks that ensure that the user is not doing something weird, like moving
    a dirty record into a new transaction.

    It is designed for internal use, such as when we are moving a clean record
    into a new transaction when the transaction is committed.

    This method must not be called unless the record is clean.

    @param {DS.Model} record
  */
  adoptRecord: function(record) {
    var oldTransaction = get(record, 'transaction');

    if (oldTransaction) {
      oldTransaction.removeRecord(record);
    }

    get(this, 'records').add(record);
    set(record, 'transaction', this);
  },

  /**
   @private

   Removes the record without performing the normal checks
   to ensure that the record is re-added to the store's
   default transaction.
  */
  removeRecord: function(record) {
    get(this, 'records').remove(record);
  }

});

DS.Transaction.reopenClass({
  ensureSameTransaction: function(records){
    var transactions = Ember.A();
    forEach( records, function(record){
      if (record){ transactions.pushObject(get(record, 'transaction')); }
    });

    var transaction = transactions.reduce(function(prev, t) {
      if (!get(t, 'isDefault')) {
        if (prev === null) { return t; }
        Ember.assert("All records in a changed relationship must be in the same transaction. You tried to change the relationship between records when one is in " + t + " and the other is in " + prev, t === prev);
      }

      return prev;
    }, null);

    if (transaction) {
      forEach( records, function(record){
        if (record){ transaction.add(record); }
      });
    } else {
      transaction = transactions.objectAt(0);
    }
    return transaction;
   }
});

})();



(function() {
var get = Ember.get;

/**
  The Mappable mixin is designed for classes that would like to
  behave as a map for configuration purposes.

  For example, the DS.Adapter class can behave like a map, with
  more semantic API, via the `map` API:

    DS.Adapter.map('App.Person', { firstName: { key: 'FIRST' } });

  Class configuration via a map-like API has a few common requirements
  that differentiate it from the standard Ember.Map implementation.

  First, values often are provided as strings that should be normalized
  into classes the first time the configuration options are used.

  Second, the values configured on parent classes should also be taken
  into account.

  Finally, setting the value of a key sometimes should merge with the
  previous value, rather than replacing it.

  This mixin provides a instance method, `createInstanceMapFor`, that
  will reify all of the configuration options set on an instance's
  constructor and provide it for the instance to use.

  Classes can implement certain hooks that allow them to customize
  the requirements listed above:

  * `resolveMapConflict` - called when a value is set for an existing
    value
  * `transformMapKey` - allows a key name (for example, a global path
    to a class) to be normalized
  * `transformMapValue` - allows a value (for example, a class that
    should be instantiated) to be normalized

  Classes that implement this mixin should also implement a class
  method built using the `generateMapFunctionFor` method:

    DS.Adapter.reopenClass({
      map: DS.Mappable.generateMapFunctionFor('attributes