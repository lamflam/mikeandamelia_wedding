
var path = require( 'path' );

module.exports = function route( cfg, app, db ) {

  var routePath = cfg.routes || 'routes';
  var routes = require( path.join( app.get('dir'), routePath ) );
  var controllers = {};
    
  routes.forEach(function( route ) {
    
    var method = route.method || 'get';
    var controllerPath = path.join( app.get('dir'), 'controllers', route.controller );
   
    if( !controllers[ route.controller ] ) {
      controllers[ route.controller ] = new (require( controllerPath ))( db );
    } 

    var controller = controllers[ route.controller ];
    var handler = controller[ route.handler ].bind( controller );
        
      if( route.path && method ) {

        app[ method ]( route.path, handler );
      }
    
  });

};
