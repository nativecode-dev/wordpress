var gulp = require('gulp-build-tasks')(require('gulp'))

gulp.build({
  js: {
    build: src => src.pipe(gulp.dest('dist')),
    src: ['src/**/*.js']
  }
})

gulp.reload({
  'gulpfile.json': [],
  'package.json': ['build'],
  'src/**/*.js': ['build:js']
}, ['build'])

gulp.task('default', ['build'])
gulp.task('watch', ['build', 'watch:reload'])
