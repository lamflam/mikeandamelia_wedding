
var injectr = require( 'injectr' );
var Model = require( '../../lib/MongoModel' );
var Mock = require( '../mocks/mongodb.js' );
var Db = injectr( '../../lib/db/index.js', { '../mongodb': Mock } );

describe( 'Model Class', function() {

  it( 'should be a function', function( next ) { 
  
    expect( typeof Model ).toEqual( 'function' );
    next();
  });

});


describe( "Model instance", function() {

  var db = new Db( { db: { db: 'rwc-test' } } );
  var Test;

  it( 'should flag when it is ready', function( next ) {
    
    db.on( 'ready', function() {
      
      expect( db() ).toBeDefined();
      Test = new Model( db(), 'test' );
      next();
    });
  });
  
  
  /*
  it( "should have an objectId method", function( next ) {

    expect( Test.objectId ).toBeDefined();
    next();
  });
  */
  
  it( 'name should be "test"', function( next ) {
    
    expect( Test.name() ).toEqual( 'test' );
    next();
  });

  it( 'should have a collection', function( next ) {
    
    expect( Test.collection() ).toBeDefined();
    next();
  });

  it( "should have an save method", function( next ) {

    expect( Test.save ).toBeDefined();
    Test.save( { name: 'test name' }, next );
  });

  it( "should have an find method", function( next ) {

    expect( Test.find ).toBeDefined();
    Test.find( {}, function( err, data ) {

      expect( data ).toBeDefined();
      expect( data[ 0 ].name ).toEqual( 'test name' ); 
      next();
    });
  });

  it( "should have an callback method", function( next ) {

    expect( Test.callback ).toBeDefined();
    next();
  });

});
