
var Controller = require('../../../lib/controller');
var User = require('./users');
var ConvoModel = require('../models/convo');
var Convo = new ConvoModel();

module.exports = Controller.extend({

	init: function() {
		this.name("convo");
		Convo.db(this.db());
	},

	create: User.hasPermission("create_convos", function(req, res, next) {
		var convo = req.body;
		Convo.create(convo, function(err, convo) {
			if (err) {
				res.status(400).json({ error: err.toString() });
			}
			else {
				res.json(convo);
			}
		});
	}),

	list: User.hasPermission("view_convos", function(req, res, next) {
		Convo.list({}, function(err, convos) {
  		if (err)
  			res.status(400).json({error: err});
  		else
  			res.json(convos);
  	});
	}),

	get: User.hasPermission("view_convos", function(req, res, next) {
		if (!req.params.id)
			res.status(400).json({error: "Invalid request"});
		else
			Convo.get({_id: Convo.objectID(req.params.id)}, function(err, msg) {
				if (err)
					res.status(400).json({error: err});
				else 
					res.json(msg);
			});
	}),

	post: User.hasPermission("edit_convos", function(req, res, next) {
		var msg = req.body;
		var convoId = req.params.id;

		if (!convoId)
			res.status(400).json({error: "No conversation id"});
		else
			Convo.post(convoId, msg, function(err, msg) {
				if (err) {
					res.status(400).json({ error: err.toString() });
				}
				else {
					res.json(msg);
				}
			});
	})
});