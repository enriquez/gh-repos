var gulp       = require('gulp');
var gutil      = require('gulp-util');
var bower      = require('bower');
var concat     = require('gulp-concat');
var sass       = require('gulp-sass');
var minifyCss  = require('gulp-minify-css');
var rename     = require('gulp-rename');
var sh         = require('shelljs');
var slim       = require('gulp-slim');
var coffee     = require('gulp-coffee');
var plumber    = require('gulp-plumber');
var image      = require('gulp-image');
var include    = require('gulp-include');
var uglify     = require('gulp-uglify');
var connect    = require('gulp-connect');
var browserify = require('gulp-browserify');
var argv       = require('yargs').argv;
var path       = require('path');

var envfile = argv.env || ".env.development"

require('dotenv').load({
  path: path.resolve(envfile)
});

var paths      = {
  sass: ['./app/stylesheets/**/*.scss'],
  views: ['./app/*.slim'],
  coffee: ['./app/javascripts/**/*.coffee', './app/javascripts/**/*.cjsx'],
  libs: ['./app/javascripts/**/*.js'],
  css: [], //'./app/bower_components/angucomplete/angucomplete.css'
  fonts: ['./bower_components/font-awesome/fonts/**/*'],
  react: ['./app/javascripts/app.cjsx'],
};

gulp.task('default', ['connect']);

gulp.task('fonts', function() { 
    gulp.src(paths.fonts) 
      .pipe(gulp.dest('./www/assets'))
});

gulp.task('views', function(done) {
  gulp.src(paths.views)
    .pipe(plumber())
    .pipe(slim({ pretty: true }))
    .pipe(gulp.dest('./www/'))
    .on('end', done);
});

gulp.task('coffee', ['libs'], function(done) {
  var options = {
    transform: ['coffee-reactify', 'envify'],
    extensions: ['.coffee', '.cjsx']
  }

  var t = gulp.src(paths.react, {read: false})
    .pipe(plumber())
    .pipe(browserify(options))
    .pipe(rename({ basename: 'builder', extname: '.js' }))
    .pipe(gulp.dest('./www/assets'))

  if(process.env.OPTIMIZE == 1) {
    t = t.pipe(uglify())
      .pipe(rename({ extname: '.min.js' }))
  }

  t.on('end', done)
});

gulp.task('libs', function(done) {
  var t = gulp.src('./app/javascripts/libs.js')
    .pipe(plumber())
    .pipe(include({ extensions: ['js'] }))
    .pipe(rename({ basename: 'builder-libs', extname: '.js' }))
    .pipe(gulp.dest('./www/assets'))

  if(process.env.OPTIMIZE == 1) {
    gulp.src('./app/javascripts/libs.js')
      .pipe(plumber())
      .pipe(include({ extensions: ['js'] }))
      .pipe(rename({ basename: 'builder-libs', extname: '.js' }))
      .pipe(uglify())
      .pipe(rename({ extname: '.min.js' }))
      .on('end', done)
  } else {
    t.on('end', done)
  }
});

gulp.task('sass', function(done) {
  gulp.src(paths.sass)
    .pipe(plumber())
    .pipe(sass({ includePaths: ['./app/bower_components'] }))
    .pipe(gulp.dest('./www/stylesheets/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('stylesheets', ['sass'], function(done) {
  var p = paths.css.concat(['./www/stylesheets/app.css']);
  var t = gulp.src(p)
    .pipe(plumber())
    .pipe(concat('all.css'))
    .pipe(rename({ basename: 'builder', extname: '.css' }))
    .pipe(gulp.dest('./www/assets/'))

  if(process.env.OPTIMIZE == 1) {
    t = t.pipe(minifyCss({ keepSpecialComments: 0 }))
      .pipe(rename({ extname: '.min.css' }))
  }

  t.on('end', done);
});

gulp.task('connect', ['watch'], function() {
  connect.server({ root: 'www', port: argv.port || '8080' });
});

gulp.task('watch', ['stylesheets', 'coffee', 'fonts', 'views'], function() {
  gulp.watch(paths.sass, ['stylesheets']);
  gulp.watch(paths.views, ['views']);
  gulp.watch(paths.coffee, ['coffee']);
  gulp.watch(paths.libs, ['coffee']);
});
