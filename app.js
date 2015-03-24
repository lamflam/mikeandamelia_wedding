
var path = require('path');
var express = require('express');
var cluster = require('cluster');
var App = require('./lib/app');


var App = module.exports = App.extend({
	setup: function() {

	  var keys = this.config.apps || {};
		var key;
		var SubApp;
		var subapp;

		for (key in keys) {
			SubApp = require(path.join(__dirname,'apps',key,'app.js'));
			subapp = new SubApp(path.join(__dirname,'apps',key,'config.json'));
			this.app.use(subapp.app);
		}
	}
});

if (require.main === module) {
  App.create(path.join(__dirname,'config.json'));
}