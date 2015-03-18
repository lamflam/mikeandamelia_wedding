
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
		User.index({ username: 1 }, {	unique: true, sparse: true });

		passport.use(new LocalStrategy(credentialFields, verifyCredentials));
		passport.use(new BearerStrategy(verifyToken));
	},

	create: function(req, res, next) {

		var user = {
			email: req.body.email,
			username: req.body.username,
			hash: req.body.hash
		};

		User.create(user, function(err, user) {
			if (err) {
				res.status(400).json({ error: err.toString() });
			}
			else {
				res.json(user);
			}
		});
	},

	list: function(req, res, next) {
  	User.find({}, function(err, users) {
  		res.json(users);
  	});
  },

  authenticate: function(req, res, next) {
		
		passport.authenticate('local', function(err, user, info) {
			if(err) return res.status(500).json({ error: err.toString() });
			if(!user) return res.status(400).json({ error: "Invalid credentials" });
			res.json(user);
		})(req, res, next);
  },

  isAuthenticated: function(req, res, next) {

		passport.authenticate('bearer', function(err, user, info) {
			req.user = user;
			next();
		})(req, res, next);
  },

  me: function(req, res, next) {
  	res.json(req.user || {});
  }

});