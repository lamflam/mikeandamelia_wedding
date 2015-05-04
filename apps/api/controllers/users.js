
var Controller = require('../../../lib/controller');
var UserModel = require('../models/user');
var User = new UserModel();
var RoleModel = require('../models/role');
var Role = new RoleModel();
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var nodemailer = require('nodemailer');
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

var hasPermission = function(permission, callback) {
	return function(req, res, next) {
		if (!req.user) {
			res.status(401).json({error: "Unauthorized"});
		}
		else {
			User.get({email: req.user.email}, function(err, user) {
				if (err)
					res.status(400).json({error: err});
				else
					Role.hasPermission(permission, user.roles || [], function(err, authorized) {
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

	update: hasPermission("edit_users", function(req, res, next) {
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

	list: hasPermission("view_users", function(req, res, next) {
		User.list({ roles: "user" }, function(err, users) {
  		if (err)
  			res.status(400).json({error: err});
  		else
  			res.json(users);
  	});
	}),

	get: hasPermission("view_users", function(req, res, next) {
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

	delete: hasPermission("delete_users", function(req, res, next) {
		if (!req.params.id)
			res.status(400).json({error: "Invalid request"});
		else
			User.delete({_id: User.objectID(req.params.id)}, function(err, deleted) {
				if (err)
					res.status(400).json({error: err});
				else 
					res.status(200).end();
			});
	}),

  authenticate: function(req, res, next) {
		
		passport.authenticate('local', function(err, user, info) {
			if(err) return res.status(500).json({ error: err.toString() });
			if(!user) return res.status(400).json({ error: "Invalid credentials" });
			res.cookie('tkn', User.getToken(user), { httpOnly: false });
			res.status(200).end();
		})(req, res, next);
  },

  isAuthenticated: function(req, res, next) {

		passport.authenticate('bearer', function(err, user, info) {
			req.user = user;
			next();
		})(req, res, next);
  },

  resetToken: function(req, res, next) {
  	var $this = this;
  	var email = req.params.email;
		if (!email)
			res.status(400).json({error: "Invalid parameters"});
		else
			User.resetToken(email, function(err, token) {
				if (err)
					res.status(400).json({error: err});
				else
					$this.sendResetEmail(email, token, function(err) {
						if (err)
							res.status(400).json({error: "Unable to send email"});
						else
							res.status(200).end();
					});
			});
  },

  resetPassword: function(req, res, next) {
  	var email = req.params.email;
  	var hash = req.body.hash;
  	var token = req.body.token;
  	if (!token || !hash)
  		res.status(400).json({error: "Invalid parameters"});
  	else
  		User.resetPassword(email, token, hash, function(err,user) {
  			if(err)
  				res.status(400).json({error: err});
  			else
  				res.status(200).end();
  		});
  },

  sendResetEmail: function(email, token, callback) {
		
		var smtp = this.config("smtp");

		this._mailer = this._mailer || 
			nodemailer.createTransport(_.clone(smtp));

		this._mailer.sendMail({
			from: smtp.auth.user,
			to: email,
			subject: 'Password reset request',
			text: 'To reset your password, please click on the link below.\n ' + 
						'localhost:3001/users/' + encodeURIComponent(email) + '/reset_password?token=' + token,
			html: '<p>Hello,<br>Please click <a href="http://' + this.config("domain") + '/users/' + 
						encodeURIComponent(email) + '/reset_password?token=' + token + '">here</a> to reset your password.</p>',
		}, function(err, info) {
			if (err)
				callback(err);
			else
				callback(null,info.messageId);
		});
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
  				res.status(200).end();
  		});
  	}
  }
}, {
	hasPermission: hasPermission
});