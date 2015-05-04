
var MongoModel = require('../../../lib/model').MongoModel;
var _ = require('underscore');

var convoFields = {
	_id: true,
	name: true,
	msgs: false
};

var publicFields = _.filter(_.keys(convoFields),function(key) { 
	return convoFields[key]; 
});

var privateFields = _.keys(_.omit(convoFields, publicFields));

var removePrivateFields = function(convo) {
	return convo ? _.omit(convo, privateFields) : null;
};

var stripExtraFields = function(convo) {
	return _.pick(convo, _.keys(convoFields));
};


module.exports = MongoModel.extend({
	
  init: function() {
  	this.name("convos");
  },

  create: function( convo, callback ) {

  	var convo = stripExtraFields(convo);
  	convo.msgs = [];
  	if (this.validate(convo))
			this.insert(convo, function(err, convos) {
				if (err) callback(err)
				else callback(null, removePrivateFields(convos[0]));
			});
		else
			callback("Invalid data");

  },

  list: function(query, callback) {
  	var project = {};
  	_.each(publicFields, function(field) { project[field] = 1; });
  	return this.find(query, {fields: project}, callback);
  },

  get: function(query, callback) {
  	return this.findOne(query, callback);
  },

  post: function(convoId, msg, callback) {

  	if (this.validateMsg(msg)) {
  		this.findAndModify({_id: this.objectID(convoId)}, [['_id',1]], {$addToSet: {msgs: msg}}, {new: true}, function(err, convo) {
  			callback(err, convo.msgs.unshift());
  		});
  	}
  	else {
  		callback("Invalid data");
  	}
  },

  validate: function( convo ) {

  	if (!convo.name) return false;
  	if (!convo.msgs || !convo.msgs.length) return false;
  	return true;
  },

  validateMsg: function( msg ) {

  	if (!msg.user) return false;
  	if (!msg.text) return false;
  	return true;
  }

});