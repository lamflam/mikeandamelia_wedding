
/*
 * Module dependencies
 */
var express = require( 'express' );
var logger = require( 'morgan' );
var path = require( 'path' );
var bodyParser = require( 'body-parser' );
var methodOverride = require( 'method-override' );
var cookieParser = require( 'cookie-parser' );
var less = require( 'express-less' );
var cluster = require('cluster');

/* Internal dependencies */
var App = require('../../lib/app');
var route = require( '../../lib/router' );
var db = require( '../../lib/db' );
var staticViewer = require( '../../lib/viewer' );

var Web = module.exports = App.extend({
  setup: function() {

    var app = this.app;
    var cfg = this.config;

    app.set('dir', __dirname);
    app.use( logger( 'combined' ) );
    app.set( 'views', path.join( __dirname, (cfg.views && cfg.views.dir) || 'views' ) );
    app.set( 'view engine', (cfg.views && cfg.views.engine) ||  'jade' );
    app.use( staticViewer( (cfg.views && cfg.views.path) || '/views', {doctype: 'html'}) );
    app.use( bodyParser.urlencoded( { extended: true } ) );
    app.use( bodyParser.json() );
    app.use( methodOverride() );
    app.use( cookieParser( cfg.cookies && cfg.cookies.secret ) );
    app.use( '/css', less( path.join( __dirname, 'less') ) );
    app.use( express.static( path.join( __dirname, 'public' ) ) );

    db( cfg.dbs || cfg.db, function(err, db) {
      route( cfg, app, db );
    });
  }
});

if (require.main === module) {
  Web.create(path.join(__dirname,'config.json'));
}