
var crypto = require('crypto');
var MongoModel = require( '../../../lib/model' ).MongoModel;
var jwt = require('jwt-simple');
var _ = require('underscore');

var privateFields = {
	hash: 0,
  salt: 0,
	iter: 0,
	token: 0
};

var removePrivateFields = function(user, keep) {
	var remove = _.omit(privateFields, keep || []);
	return user ? _.omit(user, _.keys(remove)) : null;
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


var generateToken = function(user, callback) {

	var token = jwt.encode({
		email: user.email,
		name: user.name
	}, "secret");

	user.token = token;

	if (callback) callback(null, token);
	return token;
}

module.exports = MongoModel.extend({
	
  init: function() {
  	this.name("users");
  },

  list: function(query, callback) {
  	return this.find(query, privateFields, callback);
  },

  get: function(query, callback) {
  	return this.findOne(query, privateFields, callback);
  },

  create: function( user, callback ) {

  	var $this = this;
		generateHash(user, function(err, user) {
			if ($this.validate(user)) {
				generateToken(user);
				$this.insert(user, function(err, users) {
					if (err) callback(err)
					else callback(null, users[0].token, removePrivateFields(users[0]));
				});
			} else {
				callback("Invalid data");
			}
		});
  },

  validate: function( user ) {

  	var rEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;        //'  // This fublime's syntax coloring 
  	if (!rEmail.test(user.email)) return false;
  	if (!user.name) return false;
  	if (!user.hash || user.hash.length < 64) return false;
  	if (!user.salt || user.salt.length < 64) return false;

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
					callback(null, removePrivateFields(user, ["token"])) :
					callback(null, false);
			})
		})
	},

	verifyToken: function(token, callback) {
		var user = jwt.decode(token, "secret");
		(!user || !user.email) ? 
			callback(null, false) :
			callback(null, removePrivateFields(user));
	}

});