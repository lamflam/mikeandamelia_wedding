var gulp = require('gulp');
var jade = require('gulp-jade');
var less = require('gulp-less');
var  src = require('gulp-add-src');
var  min = require('gulp-minify-css');
var  amd = require('amd-optimize');
var  cat = require('gulp-concat');
var  gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var del = require('del');

gulp.task('styles', ['clean'], function(done) {
	return gulp.src('./less/*.less')
		.pipe(less())
		.pipe(src.append('./public/css/*.css'))
		.pipe(min())
		.pipe(gulp.dest('build/public/css/'));
});

gulp.task('script', ['clean'], function(done) {
	return gulp.src(['public/script/**/*.js', '**/*.jade'])
		.pipe(gulpif(/.*\.jade$/, jade()))
		.pipe(amd("../index", {
			configFile: "public/script/index.js",
			baseUrl: "public/script/modules"
		}))
		.pipe(cat("index.js"))
		.pipe(uglify())
		.pipe(gulp.dest('build/public/script'));
});

gulp.task('copy', ['clean'], function(done) {
	return gulp.src([
		'*.js',
		'config',
		'controllers/*.js',
		'models/*.js',
		'views/*.jade',
		'public/**',
		'!public/css',
		'!public/css/**',
		'!public/script/**',
		'!gulpfile.js'
	], { base: '.' } )
	// copy the require library in, we need this one
	.pipe(src.append('public/script/lib/require-min.js', {base: '.'}))
	.pipe(gulp.dest('build'));
});

gulp.task('clean', function(done) {
	del(['build'], done);
});

gulp.task('build', ['clean', 'copy', 'script', 'styles']);

