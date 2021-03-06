
var crypto = require('crypto');
var MongoModel = require( '../../../lib/model' ).MongoModel;
var jwt = require('jwt-simple');
var _ = require('underscore');

var userFields = {
	_id: true,
	name: true,
	email: true,
	roles: true,
	rsvp: true,
	guests: true,
	comment: true,
	hash: false,
	iter: false,
	salt: false,
	reset_token: false
};

var publicFields = _.filter(_.keys(userFields),function(key) { 
	return userFields[key]; 
});

var privateFields = _.keys(_.omit(userFields, publicFields));

var removePrivateFields = function(user) {
	return user ? _.omit(user, privateFields) : null;
};

var stripExtraFields = function(user) {
	return _.pick(user, _.keys(userFields));
};

var generateHash = function( user, callback ) {

	var hash = new Buffer(user.hash, "base64");
	var salt = crypto.randomBytes(64);
	var iter = 100000;
	
	crypto.pbkdf2(hash, salt, iter, 64, function(err, hash) {
		user.hash = hash.toString('base64');
		user.salt = salt.toString('base64');
		user.iter = iter;
		callback(err, user);
	});
};

module.exports = MongoModel.extend({
	
  init: function() {
  	this.name("users");
  },

  list: function(query, callback) {
  	var project = {};
  	_.each(publicFields, function(field) { project[field] = 1; });
  	return this.find(query, {fields: project}, callback);
  },

  get: function(query, callback) {
  	var project = {};
  	_.each(publicFields, function(field) { project[field] = 1; });
  	return this.findOne(query, {fields: project}, callback);
  },

  create: function( user, callback ) {

  	var user = stripExtraFields(user);
  	var $this = this;
  	
  	if (!user.roles) {
  		user.roles = ["user"];
  	}

		generateHash(user, function(err, user) {
			if ($this.validate(user, true)) {
				$this.insert(user, function(err, users) {
					if (err) callback(err)
					else callback(null, removePrivateFields(users[0]));
				});
			} else {
				callback("Invalid data");
			}
		});
  },

  updateOne: function(user, callback) {

  	// email cannot be changed
  	var user = stripExtraFields(user);
  	var email = user.email;
  	delete user.email;
  	delete user._id;
  	delete user.roles;

  	if (this.validate(user)) {
  		this.findAndModify({email: email}, [['_id',1]], {$set: user}, {new: true}, function(err, user) {
  			callback(err, removePrivateFields(user));
  		});
  	}
  	else {
  		callback("Invalid data");
  	}
  },

  delete: function(user, callback) {

  	if (!user._id) {
  		callback("Must provide id to delete user.");
  	}
  	else
  		this.remove(user, callback);
  },

  validate: function( user, isNew ) {

  	// Only for a new user
  	var rEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;        //'  // This fublime's syntax coloring 
  	if (isNew) {
  		if (!rEmail.test(user.email)) return false;
	  	if (!user.hash || user.hash.length < 64) return false;
	  	if (!user.salt || user.salt.length < 64) return false;
  	}

  	// for all users
  	if (!user.name) return false;
  	if (user.rsvp && user.rsvp !== 'yes' && user.rsvp !== 'no') return false;

  	return true;
  },

  verifyCredentials: function(email, hash, callback) {

		this.findOne({email: email}, function(err, user) {
			if (err) return callback(err);
			if (!user) return callback(null, false);


			var hashbuf = new Buffer(hash, "base64");
			var saltbuf = new Buffer(user.salt, "base64");
			crypto.pbkdf2(hashbuf, saltbuf, user.iter, 64, function(err, hash) {
				hash = hash.toString("base64");
				(hash == user.hash) ?
					callback(null, removePrivateFields(user)) :
					callback(null, false);
			})
		})
	},

	verifyToken: function(token, callback) {
		var user = jwt.decode(token, "secret");
		(!user || !user.email || !user._id) ? 
			callback(null, false) :
			callback(null, removePrivateFields(user));
	},

	getToken: function(user, callback) {
		var token = jwt.encode({
			email: user.email,
			name: user.name,
			_id: user._id
		}, "secret");

		if (callback) callback(null, token);
		return token;
	},

	resetToken: function(email, callback) {
		
		if (!email) {
			callback({error: "No user provided"});
			return;
		}

		var date = new Date();
		// Set to expire after a day
		date.setTime(date.getTime() + (24 * 3600 * 1000));
		var token = jwt.encode({
			rand: crypto.randomBytes(16).toString('Base64'),
			expires: date
		}, "password_secret");

 		this.findAndModify(
 			{email: email}, 
 			[['_id',1]], 
 			{$set: {password_reset_token: token}}, 
 			{new: true}, 
 			function(err, user) {
				if (err)
					callback(err);
				else
					callback(null, token);
  		}
  	);
	},

	resetPassword: function(email, token, newPassword, callback) {

		var $this = this;
		var info = jwt.decode(token, "password_secret");
		
		var now = Date.now();
		var expires = new Date(info.expires);
		if (now > expires)
			callback("expired");
		else
			generateHash({hash: newPassword}, function(err, user) {
				if (err)
					callback(err);
				else
					$this.findAndModify(
						{email: email, password_reset_token: token},  
						[['_id',1]],
				    {$set: user, $unset: {password_reset_token: ''}},
				    {new: true},
				    function(err, user) {
							if (err)
								callback(err);
							else
								callback(null, removePrivateFields(user));
			  		}
			  	);
			});
	}

});