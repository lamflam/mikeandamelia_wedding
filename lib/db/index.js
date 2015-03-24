
/*
 * Takes a configuration object and loads
 * up db instances for each database.
 *
 * Returns a function that can be called
 * to retrieve the specific db instance by
 * name, or the default if no args.
 *
 * [db]
 * server=localhost
 * port=27017
 * db=db-name
 *
 * or
 *
 * [db][]
 * server=localhost
 * port=27017
 * db=db1
 *
 * [db][]
 * server=localhost
 * port=27017
 * db=db2
 *
 * This was not really necessary, but I wanted
 * to allow for dependency injecton for testing
 * as well as have the ability to load multiple
 * databases, and this structure allows me to easily
 * add support for other databases in the future whil
 * keeping the default configuration very simple.
 */

var mongo = require( 'mongodb' );

module.exports = db;

function db( cfgs, callback ) {

  if( !cfgs ) {

    cfgs = [];
  }

  if( cfgs.length === undefined ) {
  
    cfgs = [ cfgs ];
  }

  var dbs = [];
  var len = cfgs.length;
  var error;
  var i;

  for( i = 0; i < len; i++ ) {

    dbs.push( new MongoDb( cfgs[ i ], cb.bind( null, i ) ) );
  }

  /*
   * Function that returns the
   * db instance.
   */
  function $this( id ) {

    if( !id ) {
      
      return dbs[ 0 ];

    } else {
    
      return dbs.filter( function( db ) { return db.id() === id; } )[ 0 ];
    }
  }

  function cb( i, err, db ) {
    
    error = error || err;
    if( i === ( len - 1 ) ) {
      
      if( callback ) callback( error, $this ); 
    }
  }
  
  cb(-1, null, null);
  return $this;
}


/*
 * Takes in db otions and returns a thin wrapper around 
 * the mongodb object that exposes the db collection. 
 * More can be added later. In the future, it may be 
 * better to abstract this further and provide accessors 
 * to the collections functions.
 */

function MongoDb( options, callback ) {

  if( !options || !options.name ) {
    
    throw new Error( 'Invalid parameter: options.name required' );
  }

  var $this = this;
  var server = new mongo.Server( options.server || 'localhost', options.port || 27017 );  
  var db = new mongo.Db( options.name, server, { safe: true } );

  $this._db = db;
  $this._id = options.id;
  callback = callback || options.callback;

  db.open( function( err ) {
    
    if( err )
      callback( err );
    else if (options.user) {
      db.authenticate(options.user, options.password, function(err) {
        if ( err )
          callback(err);
        else
          callback(null, $this);
      });
    }
    else
      callback( null, $this );  
  }); 

  return $this;
}

MongoDb.prototype.collection = function() {

  return this._db.collection.apply( this._db, arguments );
};

MongoDb.prototype.id = function() {

  return this._id;
};
