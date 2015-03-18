
var injectr = require( 'injectr' );
var MongoMock = require( './mongo-mock/lib/mongo-mock' );
var MongoDb = injectr( '../../lib/mongodb/index.js', { mongodb: MongoMock } );

module.exports = MongoDb;
