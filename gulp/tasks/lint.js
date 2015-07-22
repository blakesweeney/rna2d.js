const gulp = require('gulp');
const config = require('../config');
const eslint = require('gulp-eslint');

gulp.task('lint', function() {
  return gulp.src(config.src.scripts.all[0])
    .pipe(eslint())
    .pipe(eslint.format());
});
