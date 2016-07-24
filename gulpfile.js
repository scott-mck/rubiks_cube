var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var cleancss = require('gulp-clean-css');

gulp.task('build', function() {
  gulp.src('./dist/built.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'));

  gulp.src('./dist/built.css')
    .pipe(cleancss())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['build']);
