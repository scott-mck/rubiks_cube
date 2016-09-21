const gulp = require('gulp')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const rename = require('gulp-rename')
const del = require('del')
const cleancss = require('gulp-clean-css')
const watch = require('gulp-watch')
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const plumber = require('gulp-plumber')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')

// Clean
gulp.task('clean', () => {
  del('dist/*')
})

// JavaScript
gulp.task('js', () => {
  browserify('./src/js/main.js')
    .transform('babelify', { presets: ['es2015'] })
    .bundle()
    .pipe(source('built.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('dist/'))
})

// JavaScript Dev
gulp.task('js-dev', () => {
  browserify('./src/js/main.js')
    .transform('babelify', { presets: ['es2015'] })
    .bundle()
    .on('error', (error) => {
      console.log(error.toString())
    })
    .pipe(source('built.js'))
    .pipe(gulp.dest('dist/'))
})

// Sass
gulp.task('sass', () => {
  gulp.src('./src/scss/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(cleancss())
    .pipe(rename('built.css'))
    .pipe(gulp.dest('dist/'))
})

// Watch
gulp.task('watch', () => {
  gulp.watch('./src/js/*.js', ['js'])
  gulp.watch('./src/scss/*.scss', ['sass'])
})

// Watch dev
gulp.task('watch-dev', () => {
  gulp.watch('./src/js/*.js', ['js-dev'])
  gulp.watch('./src/scss/*.scss', ['sass'])
})

gulp.task('default', ['clean', 'js', 'sass'])
gulp.task('dev', ['clean', 'js-dev', 'sass', 'watch-dev'])
