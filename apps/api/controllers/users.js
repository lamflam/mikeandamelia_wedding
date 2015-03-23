
var Controller = require('../../../lib/controller');
var UserModel = require('../models/user');
var User = new UserModel();
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var LocalStrategy = require('passport-local').Strategy;

var credentialFields = {
	usernameField: 'email',
	passwordField: 'hash'
};

var verifyCredentials = function(email, hash, done) {
  User.verifyCredentials(email, hash, function(err, user) {
 		done(err, user);
 	});
};

var verifyToken = function(token, done) {
	User.verifyToken(token, function(err, user) {
		done(err, user);
	});
}

module.exports = Controller.extend({

	init: function() {
		this.name("user");
		User.db(this.db());
		User.index({ email: 1 }, {	unique: true });

		passport.use(new LocalStrategy(credentialFields, verifyCredentials));
		passport.use(new BearerStrategy(verifyToken));
	},

	create: function(req, res, next) {

		var user = {
			email: req.body.email,
			name: req.body.name,
			hash: req.body.hash
		};

		User.create(user, function(err, token, user) {
			if (err) {
				res.status(400).json({ error: err.toString() });
			}
			else {
				res.cookie('tkn', token, { httpOnly: false });
				res.json(user);
			}
		});
	},

	list: function(req, res, next) {
  	User.list({}, function(err, users) {
  		res.json(users);
  	});
  },

  delete: function(req, res, next) {
  	this.db().collection("users").remove(function(){});
  	res.status(200).end();
  },	

  authenticate: function(req, res, next) {
		
		passport.authenticate('local', function(err, user, info) {
			if(err) return res.status(500).json({ error: err.toString() });
			if(!user) return res.status(400).json({ error: "Invalid credentials" });
			res.cookie('tkn', user.token, { httpOnly: false });
			res.json({});
		})(req, res, next);
  },

  isAuthenticated: function(req, res, next) {

		passport.authenticate('bearer', function(err, user, info) {
			req.user = user;
			next();
		})(req, res, next);
  },

  me: function(req, res, next) {

  	if (req.user && req.user.email) {
  		User.get({email: req.user.email}, function(err, user) {
  			if (err)
  				res.status(400).json({error: err});
  			else
  				res.json(user);
  		});
  	}
  	else {
  		res.status(400).json({error: "No user logged in"});
  	}
  }

});