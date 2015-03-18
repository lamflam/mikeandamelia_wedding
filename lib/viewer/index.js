
var path = require( 'path' );

module.exports = function( root, options ) {
	
	return function (req, res, next) {

		var url;

		if (root && (req.url.indexOf(root) !== -1)) {

			url = path.relative(root, req.url);
			res.render( path.join(path.dirname(url), path.basename(url, '.html') ), options, function(err, html) {
				if (err) {
					console.log(err);
					res.status((err.view && !err.view.path) ? 404 : 500).send();
				} else {
					res.send(html);
				}
			});

		} else {
			next();
		}
	};
};