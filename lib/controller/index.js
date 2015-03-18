
var path = require( 'path' );
var util = require( '../util' );

module.exports = Controller;

function Controller( db ) {

  this._db = db;
  this.init();
}

Controller.extend = util.extend;

Controller.prototype.init = function() {};

Controller.prototype.name = function( name ) {
    
  if ( name ) {

    this._name = name;
    return this;
  }

  return this._name;
};

Controller.prototype.db = function( id ) {

  return this._db(id);
};


Controller.prototype.model = function( model ) {

  if ( model ) {
  
    this._model = model;
    return this;
  }

  return this._model;
};


Controller.prototype.index = function( req, res, next ) {
    
  res.render( path.join( this.name() || '', 'index' ) );
};


Controller.prototype.redirect = function( req, res, next ) {

  res.redirect( '/' + this.name() );
};

