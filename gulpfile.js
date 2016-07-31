var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var cleancss = require('gulp-clean-css');
var watch = require('gulp-watch');
var sass = require('gulp-sass');
var browserify = require('gulp-browserify');

// JavaScript
gulp.task('js', function () {
  return gulp.src(['./src/js/*.js'])
    .pipe(concat('./built.js'))
    .pipe(browserify())
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'));
});

// Sass
gulp.task('sass', function() {
  gulp.src('./src/sass/*.scss')
    .pipe(sass())
    .pipe(cleancss())
    .pipe(rename('built.css'))
    .pipe(gulp.dest('./dist/'));
});

// Watch
gulp.task('watch', function() {
  gulp.watch('./src/js/*.js', ['js']);
  gulp.watch('./src/sass/*.scss', ['sass']);
});

gulp.task('default', ['build']);
gulp.task('dev', ['js', 'sass', 'watch']);
