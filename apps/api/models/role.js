
var MongoModel = require( '../../../lib/model' ).MongoModel;

module.exports = MongoModel.extend({
	
  init: function() {
  	this.name("roles");
  },

  permissions: function(roles, callback) {
  	
  	roles = roles || [];
  	var match  = { $match: { name: { $in: roles || [] } } };
  	var unwind = { $unwind: "$permissions" };
  	var merge  = { $group: { _id: "all", permissions: { $addToSet: "$permissions" } } };

  	this.aggregate(match, unwind, merge, function(err,items) { 
  		if (err)
  			callback(err)
  		else
  			callback(null, items.length > 0 ? items[0].permissions : []);
  	});
  },

  has_permission: function(permission, roles, callback) {

  	this.permissions(roles, function(err, permissions) {
  		if (err)
  			callback(err);
  		else
  			callback(null, permissions.indexOf(permission) !== -1);
  	})
  }
});