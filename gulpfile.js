
var gulp = require('gulp');
var spawn = require('child_process').spawn;
var fs = require('fs');
var del = require('del');

function subTask(task, done) {
	fs.readdir("apps", function(err, apps) {
		var len = apps.length;
		apps.forEach(function(app) {

			var path = process.cwd() + '/apps/' + app;
			fs.exists(path + '/gulpfile.js', function(exists) {
				
				var child;
				if (exists) {
					child = spawn(process.argv[0],[process.argv[1], task], { 
						cwd: path,
						stdio: ['ignore', 1, 2]
					});
 
					child.on('close', function() {
						if ((--len) == 0) done();
					});
				}
				else if ((--len) == 0) done();
			});
		});
	});
}

gulp.task('build-apps', function(done) {
	subTask('build', done);
});

gulp.task('clean', function(done) {
	del(['build'], done);
});

gulp.task('copy-apps', ['clean', 'build-apps'], function(done) {
	fs.readdir("apps", function(err, apps) {
		apps.forEach(function(app) {		
			gulp.src('apps/' + app + '/build/**')
				.pipe(gulp.dest('build/apps/' + app));
		});
		done();
	});
});

gulp.task('copy', ['clean'], function() {
	return gulp.src([
		'*.js',
		'config',
		'lib/**',
		'node_modules/**',
		'!gulpfile.js'
	], { base: '.' } )
	.pipe(gulp.dest('build'));
});

gulp.task('build', ['copy', 'copy-apps'], function(done) {
	subTask('clean', done);
});

