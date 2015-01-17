'use strict';

// built in deps
var path = require('path');

// external modules
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var livereload = require('gulp-livereload');
var newer = require('gulp-newer');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var to5 = require('gulp-6to5');
var watchify = require('watchify');

gulp.task('server', function() {
  return gulp.src(['src/*.js'])
    .pipe(newer('bin'))
    .pipe(to5())
    .pipe(gulp.dest('bin'));
});

var bundler = watchify(browserify('./src/client.jsx', watchify.args));
// add any other browserify options or transforms here
bundler.transform('reactify', {'es6': true});
bundler.transform('6to5ify');

gulp.task('client', bundle); // so you can run `gulp js` to build the file
bundler.on('update', bundle); // on any dep update, runs the bundler

gulp.task('less', function() {
  gulp.src('src/*.less')
    .pipe(less())
    .pipe(gulp.dest('bin'));
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(['src/*.js', 'src/*.jsx'], ['client']);
  gulp.watch('src/*.js', ['server']);
  gulp.watch('src/*.less', ['less']);
});

gulp.task('default', [
  'client',
  'server',
  'less'
], function() {});

function bundle() {
  return bundler.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    // optional, remove if you dont want sourcemaps
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
      .pipe(sourcemaps.write('./')) // writes .map file
    //
    .pipe(gulp.dest('./bin'))
    .pipe(livereload());
}
