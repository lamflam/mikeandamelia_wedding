
var Controller = require('../../../lib/controller');
var UserModel = require('../models/user');
var User = new UserModel();
var RoleModel = require('../models/role');
var Role = new RoleModel();
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var _ = require('underscore');

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
};

var has_permission = function(permission, callback) {
	return function(req, res, next) {
		if (!req.user) {
			res.status(401).json({error: "Unauthorized"});
		}
		else {
			User.get({email: req.user.email}, function(err, user) {
				if (err)
					res.status(400).json({error: err});
				else
					Role.has_permission(permission, user.roles || [], function(err, authorized) {
						if (err)
							res.status(400).json({error: err});
						else if (!authorized)
							res.status(401).json({error: "Unauthorized"});
						else
							callback(req, res, next);
					});
			});
		}
	};
};

module.exports = Controller.extend({

	init: function() {
		this.name("user");
		User.db(this.db());
		User.index({ email: 1 }, {	unique: true });

		Role.db(this.db());

		passport.use(new LocalStrategy(credentialFields, verifyCredentials));
		passport.use(new BearerStrategy(verifyToken));
	},

	create: function(req, res, next) {

		var user = req.body;

		User.create(user, function(err, user) {
			if (err) {
				res.status(400).json({ error: err.toString() });
			}
			else {
				res.cookie('tkn', User.getToken(user), { httpOnly: false });
				res.json(user);
			}
		});
	},

	update: has_permission("edit_users", function(req, res, next) {
		var user;
		if (!req.params.id)
			res.status(400).json({error: "Invalid request"});
		else
			user = _.extend({_id: User.objectID(req.params._id)}, req.body);
			User.updateOne(user, function(err, user) {
				if (err)
					res.status(400).json({error: err});
				else
					res.json(user);
			});
  }),

	list: has_permission("view_users", function(req, res, next) {
		User.list({ roles: "user" }, function(err, users) {
  		if (err)
  			res.status(400).json({error: err});
  		else
  			res.json(users);
  	});
	}),

	get: has_permission("view_users", function(req, res, next) {
		if (!req.params.id)
			res.status(400).json({error: "Invalid request"});
		else
			User.get({_id: User.objectID(req.params.id)}, function(err, user) {
				if (err)
					res.status(400).json({error: err});
				else 
					res.json(user);
			});
	}),

  authenticate: function(req, res, next) {
		
		passport.authenticate('local', function(err, user, info) {
			if(err) return res.status(500).json({ error: err.toString() });
			if(!user) return res.status(400).json({ error: "Invalid credentials" });
			res.cookie('tkn', User.getToken(user), { httpOnly: false });
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
  			else {
  				if (user)
  					res.cookie('tkn', User.getToken(user), { httpOnly: false });
  				res.json(user);
  			}
  		});
  	}
  	else {
  		res.status(400).json({error: "No user logged in"});
  	}
  },

  updateMe: function(req, res, next) {
  	var user;
  	if (!req.user)
  		res.status(401).json({error: "Not logged in"});
  	else {
  		user = _.extend({_id: User.objectID(req.user._id)}, req.body);
  		User.updateOne(user, function(err, user) {
  			if (err)
  				res.status(400).json({error: err});
  			else
  				res.json(user);
  		});
  	}
  }
});