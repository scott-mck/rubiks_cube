var gulp = require('gulp');
var uglify = require('gulp-uglify');
var cleancss = require('gulp-clean-css');

gulp.task('build', function() {
  console.log('gulping')
  gulp.src('dist/built.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/'));

  gulp.src('dist/built.scss')
    .pipe(cleancss())
    .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['build']);
