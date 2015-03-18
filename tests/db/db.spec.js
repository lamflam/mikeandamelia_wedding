
var injectr = require( 'injectr' );
var mockdb = require( '../mocks/mongo-mock/lib/mongo-mock' );
var db = injectr( '../../lib/db/index.js', { mongodb: mockdb });

var cfgObj = {
  name: 'rwc-test',
  server: 'localhost',
  port: 27017
};

var cfgArray = [
  {
    id: 'test',
    name: 'rwc-test',
    server: 'localhost',
    port: 27017
  },
  {
    id: 'dev',
    name: 'rwc-dev',
    server: 'localhost',
    port: 27017
  }
];

describe( 'db module', function() {

  it( 'should be a function', function( next ) {

    expect( typeof db ).toEqual( 'function' );
    next();
  });

  it( 'should error with no arguments on first call', function( next ) {

    expect( db.bind( null ) ).toThrow();
    next();
  });

  it( 'should accept a single db config and the callback should return the same instance', function( next ) {

    var db1 = db( cfgObj, function( err, db2 ) {
    
      expect( err ).toBe( null );
      expect( typeof db ).toEqual( 'function' );
      expect( db1 ).toEqual( db2 );
      next();
    });
    
  });

  it( 'should return the db with no args for single db configuration', function( next ) {
  
    db( cfgObj, function( err, db ) {
    
      expect( err ).toBe( null );
      expect( db() ).toBeDefined();
      expect( db().id() ).not.toBeDefined();
      next();
    });
    
  });

  it( 'should return the dbs by name for an array configuration', function( next ) {
  
    db( cfgArray, function( err, db ) {
    
      expect( err ).toBe( null );
      expect( db() ).toBeDefined();
      expect( db().id() ).toBe( 'test' );
      expect( db( 'test' ).id() ).toBe( 'test' );
      expect( db( 'dev' ).id() ).toBe( 'dev' );
      next();
    });

  });

  it( 'should expose the collection method of the individual db instances', function( next ) {

    db( cfgArray, function( err, db ) {
      
      expect( err ).toBe( null );
      expect( typeof db().collection ).toEqual( 'function' ); 
      expect( typeof db().collection( 'test' ).find ).toEqual( 'function' );
      next();
    });
    
  });

});
