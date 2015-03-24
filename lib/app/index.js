
var fs = require('fs');
var util = require('../util');
var cluster = require('cluster');
var express = require('express');

module.exports = App;

var proxy = function(subject, getter) {
	
	if (subject.__proxied__)
		return subject;

	var obj = Object.create(null);
	Object.defineProperty(obj, "__proxied__", { value: true, enumerable: false });

	Object.getOwnPropertyNames(subject).forEach(function(prop) {
		Object.defineProperty(obj, prop, {
			get: function() {
				return typeof subject[prop] != 'object' ?
					getter(subject,prop) :
					proxy(subject[prop],getter);
			},
			enumerable: true
		});
	});
	return obj;
};

function App(cfg) {
	this.config = App.config(cfg);
	this.app = express();
	this.setup();
};

App.extend = util.extend;

App.config = function(cfg) {
	
	var eval = /env\((.*)\)/;
	var env = process.env;
	var envConfig = (env.APP_CONFIG || "").replace(/\\(.)/g,"$1");
	var config;
	if (!cfg) {
		config = JSON.parse(envConfig)
	}
	else if (typeof cfg == 'string') {
		if (fs.existsSync(cfg)) 
			config = require(cfg)
		else {
			config = JSON.parse(envConfig);
		}
	}
	else {
		config = cfg;
	}

	return proxy(config, function(obj,prop) {
		var name = eval.exec(obj[prop]);
		return name ? env[name[1]] : obj[prop];
	});
};

App.create = function(cfg) {

	var config = App.config(cfg);
	var workers = config.workers || 1;
	var app;
	var i;

	if (cluster.isMaster) {
		for (i = 0; i < workers; i++) {
			cluster.fork();
		}
	}
	else {
		app = new this(config);
		app.master(true);
		app.start();
	}
};

App.prototype.master = function(master) {
	
	if (arguments.length == 0) {
		return this._master;
	}
	else {
		this._master = master;
		return this;
	}
}

App.prototype.start = function() {
  if (this.master()) {
  	this.listen();
  } 
};

App.prototype.listen = function() {
  var config = this.config;
  this.app.listen( config.port || 3001, config.hostname || 'localhost', function() {
    console.log( "Started listening on " + config.hostname + ":" + config.port ); 
  });
};

App.prototype.setup = function() {};