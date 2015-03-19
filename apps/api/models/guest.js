
var MongoModel = require( '../../../lib/model' ).MongoModel;

module.exports = MongoModel.extend({
	
  init: function() {
  	this.name("guests");
  },

  create: function( guest, callback ) {

  	var $this = this;
		if ($this.validate(guest)) {
		  $this.insert(guest, function(err, guests) {
				if (err) callback(err)
				else callback(null, guests[0]);
			});
		} else {
			callback("Invalid data");
		}
  },

  validate: function( guest ) {

  	var rEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;        //'  // This fublime's syntax coloring 
  	if (!rEmail.test(guest.email)) return false;
  	if (!guest.name) return false;

  	return true;
  }

});