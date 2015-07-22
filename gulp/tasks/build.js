const gulp = require('gulp');
const gulpif = require('gulp-if');
const gutil = require('gulp-util');

// Transforming stuff
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');

const config = require('../config');

// Build all javascript
gulp.task('build', function() {
  return gulp.src(config.src.scripts.all)
    .pipe(gulpif(config.env === 'development', sourcemaps.init({
      loadMaps: true,
    })))
    .pipe(babel())
    .pipe(concat(config.src.scripts.bundled))
    .on('error', function(err) {
      gutil.log(gutil.colors.red(err));
    })
    .pipe(gulpif(config.env === 'production', uglify({
      mangle: false,
    })))
    .pipe(gulpif(config.env === 'development', sourcemaps.write('./')))
    .pipe(gulp.dest(config.dest));
});
