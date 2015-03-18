
var MongoDb = require( '../../lib/mongodb' );
var options = {
  db: 'rwc-test',
  server: 'localhost',
  port: 27017
};

describe( 'MongoDb Class', function() {

  it( 'should be a function', function( next ) {

    expect( typeof MongoDb ).toEqual( 'function' );
    next();
  });

  it( 'should error without options or options.db', function( next ) {

    expect( MongoDb ).toThrow();
    expect( MongoDb.bind( null, {} ) ).toThrow();
    expect( MongoDb.bind( null, "string" ) ).toThrow();
    expect( MongoDb.bind( null, 123 ) ).toThrow();
    next();
  });

  var object = new MongoDb( options  );

  it( 'should create an object with an "on" method', function( next ) {

    expect( object.on ).toBeDefined();
    next();
  });

  it( 'should create an object with an "emit" method', function( next ) {

    expect( object.emit ).toBeDefined();
    next();
  });

  it( 'should create an object with a "collection" method', function( next ) {

    expect( object.collection ).toBeDefined();
    next();
  });

});
