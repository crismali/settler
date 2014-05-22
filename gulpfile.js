var concat = require('gulp-concat');
var gulp = require('gulp');
var util = require('gulp-util');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('compile-app', function() {
  return gulp.src([
    'lib/settler.js'
  ])
    .pipe(concat('settler.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('minify-app', ['compile-app'], function() {
  return gulp.src('dist/settler.js')
    .pipe(uglify().on('error', util.log))
    .pipe(rename('settler.min.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['minify-app']);

gulp.task('watch', function() {
  gulp.watch(['lib/**/*'], ['build']);
});

gulp.task('default', ['build', 'watch']);
