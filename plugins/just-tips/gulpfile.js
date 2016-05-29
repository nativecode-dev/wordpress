'use strict';

var bower = require('gulp-bower'),
  config = JSON.parse(require('fs').readFileSync('config.json')),
  gulp = require('gulp'),
  merge = require('util-merge'),
  $path = require('path'),
  reporters = require('reporters'),
  use = require('gulp-load-plugins')()

function expand(context, template, options) {
  options = merge({
    quote: undefined
  }, options)
  while (template.indexOf('{{') >= 0) {
    template = template.replace(/\{\{([\w,_,-,\.]+)\}\}/g, (item, key) => {
      if (context[key] instanceof Array) {
        return context[key].map((value) => '\'' + value + '\'').join(',')
      }
      return context[key] ? context[key] : item
    })
  }
  return template;
}

gulp.task('bower', () => {
  return bower({ cmd: 'install' })
})

gulp.task('typings', () => {
  return gulp.src(config.ts.typings.target)
    .pipe(use.typings())
})

gulp.task('html', ['less', 'ts'], () => {
  return gulp.src(config.html.globs)
    .pipe(use.cached('html'))
    .pipe(use.plumber())
    .pipe(use.wiredep(config.wiredep.options))
    .pipe(gulp.dest(config.dist))
})

gulp.task('less', () => {
  return gulp.src(config.less.globs)
    .pipe(use.cached('less'))
    .pipe(use.plumber())
    .pipe(use.less())
    .on('error', use.lessReporter)
    .pipe(use.csslint())
    .pipe(use.csslint.reporter(reporters('gulp-csslint')))
    .pipe(use.autoprefixer(config.css.autoprefixer.options))
    .pipe(use.cleanCss(config.css.clean.options))
    .pipe(gulp.dest(config.dist))
})

gulp.task('php', () => {
  var depends = require('wiredep')()
  function wp_enqueue(path, type) {
    var context = {
      dependencies: [],
      filepath: $path.parse(path),
      name: path.split('/')[2],
      path: path.replace('../', ''),
      type: type
    }
    var pack = depends.packages[context.name]
    if (pack && pack.dependencies) {
      context.dependencies = Object.keys(pack.dependencies)
    }
    return expand(context,
      'wp_enqueue_{{type}}( \'{{name}}\', plugin_dir_url() . \'{{path}}\', array( {{dependencies}} ), $this->version, \'all\' );', {
        quote: '\''
      })
  }

  return gulp.src(config.php.globs)
    .pipe(use.cached('php'))
    .pipe(use.plumber())
    .pipe(use.wiredep(merge(config.wiredep.options, {
      ignorePath: '../dist/',
      fileTypes: {
        php: {
          block: /(([ \t]*)\/\*\s*bower:*(\S*)\s*\*\/)(\n|\r|.)*?(\/\*\s*endbower\s*\*\/)/gi,
          detect: {
            css: /wp_enqueue_style.*\.css(')/gi,
            js: /wp_enqueue_style.*\.js(')/gi
          },
          replace: {
            css: (path) => wp_enqueue(path, 'style'),
            js: (path) => wp_enqueue(path, 'script')
          }
        }
      }
    })))
    .pipe(gulp.dest(config.dist))
})

gulp.task('ts', ['ts:lint'], () => {
  return gulp.src(config.ts.target)
    .pipe(use.cached('ts'))
    .pipe(use.plumber())
    .pipe(use.sourcemaps.init())
    .pipe(use.typescript(config.ts.options))
    .pipe(use.uglify())
    .pipe(use.sourcemaps.write('.'))
    .pipe(gulp.dest(config.dist))
})

gulp.task('ts:lint', () => {
  return gulp.src(config.ts.globs)
    .pipe(use.cached('ts'))
    .pipe(use.plumber())
    .pipe(use.tslint(config.ts.lint))
    .pipe(use.tslint.report(reporters('gulp-tslint')))
})

gulp.task('package', ['shrinkwrap'], () => {
  var npm = JSON.parse(require('fs').readFileSync('package.json'))
  return gulp.src(config.zip.globs)
    .pipe(use.plumber())
    .pipe(use.zip(npm.name + '.' + npm.version + '.zip'))
    .pipe(gulp.dest(config.dist))
})

gulp.task('shrinkwrap', ['build'], () => {
  return gulp.src('package.json')
    .pipe(use.shrinkwrap())
    .pipe(gulp.dest('.'))
})

gulp.task('default', ['build'])
gulp.task('clean', () => {
  return gulp.src(config.clean.globs)
    .pipe(use.clean(config.clean.options))
})
gulp.task('build', ['bower', 'typings'], () => gulp.start(['wiredep']))
gulp.task('watch', ['watch:reload'])
gulp.task('watch:rebuild', ['build'], () => {
  config.watchers = [
    gulp.watch(config.globs, ['build']),
    gulp.watch(config.html.globs, ['html']),
    gulp.watch(config.less.globs, ['less']),
    gulp.watch(config.php.globs, ['php']),
    gulp.watch(config.ts.globs, ['ts']),
    gulp.watch(config.ts.typings.target, ['ts'])
  ]
})
gulp.task('watch:reload', ['watch:rebuild'], () => {
  gulp.watch(config.gulp.globs, () => {
    if (config.spawned) {
      config.spawned.kill()
    }
    var args = process.argv.slice(1, 2),
      count = config.watchers ? config.watchers.length - 1 : 0,
      exec = process.argv[0]

    while (count > 0) {
      config.watchers[count].end().remove()
      count--
    }
    config.watchers = []

    args.push('watch:rebuild')
    config.spawned = require('child_process').spawn(exec, args, {
      cwd: process.cwd(),
      stdio: 'inherit'
    })
  })
})
gulp.task('wiredep', ['html', 'php'])
