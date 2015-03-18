
/*
 * Module dependencies
 */
var logger = require( 'morgan' );
var bodyParser = require( 'body-parser' );
var methodOverride = require( 'method-override' );
var cluster = require('cluster');
var passport = require('passport');

/* Internal dependencies */
var App = require('../../lib/app');
var route = require( '../../lib/router' );
var db = require( '../../lib/db' );
var staticViewer = require( '../../lib/viewer' );

var Api = module.exports = App.extend({
  setup: function() {

    var app = this.app;
    var cfg = this.config;

    app.set('dir', __dirname);
    app.use( logger( 'combined' ) );
    app.use( bodyParser.urlencoded( { extended: true } ) );
    app.use( bodyParser.json( { extended: true } ) );
    app.use( bodyParser.json() );
    app.use( methodOverride() );
    app.use( passport.initialize() );

    db( cfg.dbs || cfg.db, function(err, db) {
      route( cfg, app, db );
    });
  }
});

if (require.main === module) {
  Api.create(path.join(__dirname,'config.json'));
}

