// Gulp restart when gulpfile is changed
var gulp = require('gulp'),
  spawn = require('child_process').spawn

gulp.task('gulp-autoreload', function () {
  // Store current process if any
  var p

  gulp.watch('gulpfile.js', spawnChildren);
  // Comment the line below if you start your server by yourslef anywhere else
  spawnChildren()

  function spawnChildren(e) {
    if (p) {
      p.kill()
    }

    p = spawn('gulp.cmd', ['build'], { stdio: 'inherit' })
  }
})

gulp.task('build', function () {
  // Your stuff here with build
  // Moreover, it's a good idea to have livereload if necessary
  return gulp.src('index.js')
    .pipe(gulp.dest('dist'))
})

gulp.task('default', ['build', 'gulp-autoreload'])
