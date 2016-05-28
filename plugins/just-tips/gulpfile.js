/// <reference path="typings/index.d.ts" />
'use strict'

var bower = require('gulp-bower'),
  config = JSON.parse(require('fs').readFileSync('config.json')),
  gulp = require('gulp'),
  merge = require('util-merge'),
  reporters = require('reporters'),
  use = require('gulp-load-plugins')()

gulp.task('bower', () => {
  return bower({ cmd: 'install' })
})

gulp.task('reload', () => {
  var process
  gulp.watch(['gulpfile.js', 'config.json'], spawner)
  spawner()

  function spawner() {
    if (process) {
      process.kill()
    }
    process = require('child_process')
      .spawn('gulp.cmd', ['build'], { stdio: 'inherit' })
      .on('error', (error) => utils.log(error))
  }
})

gulp.task('typings', () => {
  return gulp.src(config.ts.typings.globs)
    .pipe(use.typings())
})

gulp.task('html', ['bower', 'less'], () => {
  return gulp.src(config.html.globs)
    .pipe(use.cached('html'))
    .pipe(use.wiredep(config.wiredep.options))
    .pipe(gulp.dest(config.dest))
})

gulp.task('less', ['bower'], () => {
  return gulp.src(config.less.globs)
    .pipe(use.cached('less'))
    .pipe(use.less())
    .on('error', use.lessReporter)
    .pipe(use.postcss([require('autoprefixer')(), use.cleanCss]))
    .pipe(use.concat(config.less.target))
    .pipe(use.csslint())
    .pipe(gulp.dest(config.dest))
})

gulp.task('php', () => {
  return gulp.src(config.php.globs)
    .pipe(use.cached('php'))
    .pipe(gulp.dest(config.dest))
})

gulp.task('ts', ['bower', 'typings'], () => {
  return gulp.src(config.ts.target)
    .pipe(use.cached('ts'))
    .pipe(use.sourcemaps.init())
    .pipe(use.tslint())
    .pipe(use.typescript(config.ts.options))
    .pipe(use.uglify())
    .pipe(use.concat(config.js.target))
    .pipe(use.sourcemaps.write('.'))
    .pipe(gulp.dest(config.dest))
})

gulp.task('default', ['build'])
gulp.task('build', ['wiredep'])
gulp.task('watch', ['build'], () => {
  gulp.watch(config.bower.target, ['wiredep'])
  gulp.watch(config.html.globs, ['html'])
  gulp.watch(config.less.globs, ['less'])
  gulp.watch(config.php.globs, ['php'])
  gulp.watch(config.ts.globs, ['ts'])
  gulp.watch(config.gulp.globs, ['reload'])
})
gulp.task('wiredep', ['html', 'less', 'ts'])
