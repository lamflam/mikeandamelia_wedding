var gulp = require('gulp');
var jade = require('gulp-jade');
var less = require('gulp-less');
var  src = require('gulp-add-src');
var  min = require('gulp-minify-css');
var  amd = require('amd-optimize');
var  cat = require('gulp-concat');
var  gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var debug = require('gulp-debug');
var del = require('del');

gulp.task('copy', ['clean'], function(done) {
	return gulp.src([
		'*.js',
		'config',
		'controllers/*.js',
		'models/*.js',
		'!gulpfile.js'
	], { base: '.' } )
	.pipe(gulp.dest('build'));
});

gulp.task('clean', function(done) {
	del(['build'], done);
});

gulp.task('build', ['clean', 'copy']);

