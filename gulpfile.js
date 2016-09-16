var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var del = require('del');
var cleancss = require('gulp-clean-css');
var watch = require('gulp-watch');
var sass = require('gulp-sass');
var babel = require('gulp-babel')
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

// Clean
gulp.task('clean', function() {
  del('dist/*');
});

// JavaScript
gulp.task('js', function () {
  browserify('./src/js/main.js')
    .transform('babelify', { presets: ['es2015'] })
    .bundle()
    .pipe(source('built.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('dist/'));
});

// JavaScript Dev
gulp.task('js-dev', function () {
  browserify('./src/js/main.js')
    .transform('babelify', { presets: ['es2015'] })
    .bundle()
    .pipe(source('built.js'))
    .pipe(gulp.dest('dist/'));
});

// Sass
gulp.task('sass', function() {
  gulp.src('./src/scss/*.scss')
    .pipe(sass())
    .pipe(cleancss())
    .pipe(rename('built.css'))
    .pipe(gulp.dest('dist/'));
});

// Watch
gulp.task('watch', function() {
  gulp.watch('./src/js/*.js', ['js']);
  gulp.watch('./src/scss/*.scss', ['sass']);
});

// Watch dev
gulp.task('watch-dev', function() {
  gulp.watch('./src/js/*.js', ['js-dev']);
  gulp.watch('./src/scss/*.scss', ['sass']);
});

gulp.task('default', ['clean', 'js', 'sass']);
gulp.task('dev', ['clean', 'js-dev', 'sass', 'watch-dev']);
