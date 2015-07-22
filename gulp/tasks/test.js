const gulp = require('gulp');
const mocha = require('gulp-mocha');
const config = require('../config');

gulp.task('test', function() {
  return gulp.src(config.tests.all, {read: false})
    .pipe(mocha());
});
