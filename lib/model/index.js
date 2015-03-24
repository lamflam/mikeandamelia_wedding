
/*
 *  This is a pretty thin wrapper around the native mongo collection
 *  that follows the same API. A slight and simple abstraction for 2
 *  purposes:
 *     1. Ability to pass callback directly to find/sort methods
 *     2. Allows for dropping in other databases in the future and just
 *        implement the same interface on top of them without changing code
 *        further up the line, although a further abstraction class would be
 *        better if multiple databases are gong to be used.
 */

var util = require( '../util' );
var MongoDb = require( 'mongodb' );

module.exports = {
  MongoModel: MongoModel
};

function MongoModel( db, collection ) {

  this._db = db;
  this._collection = collection;
  this.init();
}

MongoModel.extend = util.extend;

MongoModel.prototype.init = function() {};

MongoModel.prototype.validate = function() { return true; };

MongoModel.prototype.db = function( db ) {

  if( db ) {
    
    this._db = db;
    return this;
  }

  return this._db;
}

MongoModel.prototype.objectID = function(id) {
  return MongoDb.ObjectID(id);
};

MongoModel.prototype.collection = function() {

  return this._db.collection( this._collection );
};


MongoModel.prototype.name = function( name ) {

  if( name ) {
  
    this._collection = name; 
    return this;
  }

  return this._collection;
};


MongoModel.prototype.find = function( query, projection, callback ) {

  if (typeof projection == 'function') {
    callback = projection;
    projection = {};
  }

  this._results = this.collection().find( query || {}, projection );

  if( callback ) {

    this.callback( callback );
  }

  return this;
};

MongoModel.prototype.findOne = function( query, projection, callback ) {

  if (typeof projection == 'function') {
    callback = projection;
    projection = {};
  }

  this.collection().findOne( query || {}, projection, callback || function() {});

  return this;
};


MongoModel.prototype.sort = function( query, projection, callback ) {

  if (typeof projection == 'function') {
    callback = projection;
    projection = {};
  }

  if( !this._results ) {

    throw new Error( "There are no results to process, call 'find' to get results first" );
  }

  this._results = this._results.sort( query || {} );

  if( callback ) {

    this.callback( callback );
  }

  return this;
};


MongoModel.prototype.callback = function( callback ) {

  if( !this._results ) {

    throw new Error( "There are no results to process, call 'find' to get results first" );
  }

  this._results.toArray( callback );
  delete this._results;

  return this;
};


MongoModel.prototype.save = function( object, options, callback ) {

  this.collection().save( object, options, callback );

  return this;
};

MongoModel.prototype.insert = function( object, options, callback ) {

  this.collection().insert( object, options, callback );

  return this;
};

MongoModel.prototype.update = function( selector, object, options, callback ) {

  this.collection().update( selector, object, options, callback );

  return this;
};

MongoModel.prototype.findAndModify = function() {

  this.collection().findAndModify.apply(this.collection(), arguments);

  return this;
};

MongoModel.prototype.index = function( fields, options, callback ) {

  callback = callback || function() {};
  this.collection().ensureIndex( fields, options, callback );
};

MongoModel.prototype.aggregate = function() {

  this.collection().aggregate.apply(this.collection(), arguments);
};
