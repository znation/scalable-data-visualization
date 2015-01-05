'use strict';

// built in deps
var path = require('path');

// external modules
var watchify = require('gulp-watchify');
var gulp = require('gulp');
var newer = require('gulp-newer');
var react = require('gulp-react');
var rename = require('gulp-rename');
var to5 = require('gulp-6to5');

gulp.task('server', function() {
  return gulp.src('src/server.js')
    .pipe(newer('bin'))
    .pipe(to5())
    .pipe(gulp.dest('bin'));
});

// Hack to enable configurable watchify watching
var watching = false;
gulp.task('enable-watch-mode', function() { watching = true });

gulp.task('jsx', function() {
  return gulp.src('src/**/*.jsx')
    .pipe(newer({
      dest: 'build',
      map: function(relativePath) {
        return path.basename(relativePath, '.jsx') + '.js';
      }
    }))
    .pipe(react())
    .pipe(rename(function(path) {
      path.extname = '.js';
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('client', ['jsx'], watchify(function(watchify) {
  return gulp.src('build/client.js')
    .pipe(newer('bin'))
    .pipe(watchify({
      watch: watching
    }))
    .pipe(gulp.dest('bin'));
}));

gulp.task('watch', function() {
  gulp.watch('src/client.jsx', ['enable-watch-mode', 'client']);
  gulp.watch('src/server.js', ['server']);
});

gulp.task('default', [
  'client',
  'server'
], function() {});
