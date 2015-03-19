
var Controller = require('../../../lib/controller');
var GuestModel = require('../models/guest');
var Guest = new GuestModel();

module.exports = Controller.extend({

	init: function() {
		this.name("guest");
		Guest.db(this.db());
		Guest.index({ email: 1 }, {	unique: true });

	},

	create: function(req, res, next) {

		var guest = {
			name: req.body.name,
			email: req.body.email
		};

		Guest.create(guest, function(err, guest) {
			if (err) {
				res.status(400).json({ error: err.toString() });
			}
			else {
				res.json(guest);
			}
		});
	},

	list: function(req, res, next) {
  	Guest.find({}, function(err, guests) {
  		res.json(guests);
  	});
  }
});