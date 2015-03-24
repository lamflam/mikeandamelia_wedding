
requirejs.config({

  paths: {
    "underscore": "../lib/underscore-min",
    "jquery": "../lib/jquery-1.11.1.min",
    "bootstrap": "../lib/bootstrap.min",
    "backbone": "../lib/backbone-min",
    "handlebars": "../lib/handlebars-v2.0.0",
    "text": "../lib/text",
    "hash": "../lib/hash",
    "tmpl": "../../../views"
  },

  shim: {

    backbone: {
      deps: [ "underscore", "jquery" ],
      exports: "Backbone"
    },

    bootstrap: {
      deps: [ "jquery" ]
    },

    text: {
      deps: [ "bootstrap" ]
    }
  },

  baseUrl: "/script/modules"

});

require([ "main" ], function( Main ) {

  window.app = new Main();
});