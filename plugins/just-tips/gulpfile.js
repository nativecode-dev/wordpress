/// <reference path="typings/index.d.ts" />
'use strict';

var $ = JSON.parse(require('fs').readFileSync('config.json')),
  bower = require('gulp-bower'),
  deploy = $.deployments[process.env.environment || 'development'],
  $fs = require('fs'),
  gulp = require('gulp'),
  npm = JSON.parse(require('fs').readFileSync('package.json')),
  merge = require('util-merge'),
  $path = require('path'),
  reporters = require('reporters'),
  use = require('gulp-load-plugins')()

function $expand(template, context, options) {
  options = merge({
    quote: undefined
  }, options)
  while (template.indexOf('{{') >= 0) {
    template = template.replace(/\{\{([\w,_,-,\.]+)\}\}/g, (item, key) => {
      var property = context[key]
      if (property instanceof Array) {
        return property.map((value) => '\'' + value + '\'').join(',')
      } else if (property instanceof Function) {
        return property().map((value) => '\'' + value + '\'').join(',')
      }
      return property ? property : item
    })
  }
  return template;
}

function $ssh() {
  return use.ssh({
    ignoreErrors: false,
    sshConfig: merge(deploy.ssh, {
      privateKey: $fs.readFileSync(deploy.key).toString()
    })
  })
}

gulp.task('bower', () => {
  return bower({ cmd: 'install' })
})

gulp.task('typings', ['bower'], () => {
  return gulp.src($.ts.typings.target)
    .pipe(use.typings())
})

gulp.task('html', ['less', 'ts'], () => {
  return gulp.src($.html.globs)
    .pipe(use.cached('html'))
    .pipe(use.debug({ title: 'html:' }))
    .pipe(use.plumber())
    .pipe(use.wiredep($.wiredep.options))
    .pipe(gulp.dest($.dist))
})

gulp.task('less', () => {
  return gulp.src($.less.globs)
    .pipe(use.cached('less'))
    .pipe(use.debug({ title: 'less:' }))
    .pipe(use.plumber())
    .pipe(use.less()).on('error', use.lessReporter)
    .pipe(use.csslint())
    .pipe(use.csslint.reporter(reporters('gulp-csslint')))
    .pipe(use.autoprefixer($.css.autoprefixer.options))
    .pipe(use.cleanCss($.css.clean.options))
    .pipe(gulp.dest($.dist))
})

gulp.task('php', ['less', 'ts'], () => {
  var depends = require('wiredep')()
  function $wp_enqueue(path, type) {
    var context = {
      dependencies: () => Object.keys(depends.packages[context.name].dependencies),
      filepath: $path.parse(path),
      name: path.split('/')[2],
      path: path,
      type: type
    }
    return $expand('wp_enqueue_{{type}}( \'{{name}}\', plugin_dir_url( __FILE__ ) . \'{{path}}\', array( {{dependencies}} ), $this->version, \'all\' );',
      context, {
        quote: '\''
      })
  }
  return gulp.src($.php.globs)
    .pipe(use.cached('php'))
    .pipe(use.debug({ title: 'php:' }))
    .pipe(use.plumber())
    .pipe(use.tokenReplace({ tokens: { config: $, npm: npm, plugin: $.plugin } }))
    .pipe(use.wiredep(merge($.wiredep.options, {
      ignorePath: '../dist/',
      fileTypes: {
        php: {
          block: /(([ \t]*)\/\*\s*bower:*(\S*)\s*\*\/)(\n|\r|.)*?(\/\*\s*endbower\s*\*\/)/gi,
          detect: {
            css: /wp_enqueue_style.*\.css(')/gi,
            js: /wp_enqueue_style.*\.js(')/gi
          },
          replace: {
            css: (path) => $wp_enqueue(path, 'style'),
            js: (path) => $wp_enqueue(path, 'script')
          }
        }
      }
    })))
    .pipe(gulp.dest($.dist))
})

gulp.task('ts', ['ts:lint'], () => {
  return gulp.src($.ts.target)
    .pipe(use.cached('ts'))
    .pipe(use.debug({ title: 'ts:' }))
    .pipe(use.plumber())
    .pipe(use.sourcemaps.init())
    .pipe(use.typescript($.ts.options))
    .pipe(use.uglify())
    .pipe(use.sourcemaps.write('.'))
    .pipe(gulp.dest($.dist))
})

gulp.task('ts:lint', () => {
  return gulp.src($.ts.globs)
    .pipe(use.cached('tslint'))
    .pipe(use.debug({ title: 'ts-lint:' }))
    .pipe(use.plumber())
    .pipe(use.tslint($.ts.lint))
    .pipe(use.tslint.report(reporters('gulp-tslint')))
})

gulp.task('package', ['shrinkwrap'], () => {
  return gulp.src($.zip.include)
    .pipe(use.plumber())
    .pipe(use.debug({ title: 'archive:' }))
    .pipe(use.zip(npm.name + '.' + npm.version + '.zip'))
    .pipe(gulp.dest($.dist))
})

gulp.task('deploy:clean', ['package'], () => {
  return $ssh().exec(['rm -rf ' + deploy.ssh.path], { filePath: 'deploy-clean.log' })
    .pipe(gulp.dest($.logs.target))
})
gulp.task('deploy:files', ['deploy:clean'], () => {
  return gulp.src(deploy.globs)
    .pipe(use.plumber())
    .pipe($ssh().dest(deploy.ssh.path))
})
gulp.task('deploy', ['deploy:files'], () => {
  return $ssh()
    .exec([
      $expand('chown -R www-data:www-data {{path}}', deploy.ssh),
      $expand('unzip -o {{path}}/*.zip -d {{path}}/', deploy.ssh)
    ], { filePath: 'deploy-push.log' })
    .pipe(gulp.dest($.logs.target))
})

gulp.task('shrinkwrap', ['build'], () => {
  return gulp.src('package.json')
    .pipe(use.plumber())
    .pipe(use.shrinkwrap())
    .pipe(gulp.dest('.'))
})

gulp.task('default', ['build'])
gulp.task('clean', () => {
  return gulp.src($.clean.globs)
    .pipe(use.clean($.clean.options))
    .pipe(use.debug({ title: 'clean:' }))
})
gulp.task('build', ['typings'], () => gulp.start(['wiredep']))
gulp.task('watch', ['watch:reload'])
gulp.task('watch:rebuild', () => {
  npm = JSON.parse(require('fs').readFileSync('package.json'))
  $.watchers = [
    gulp.watch($.html.globs, ['html']),
    gulp.watch($.less.globs, ['less']),
    gulp.watch($.php.globs, ['php']),
    gulp.watch($.ts.globs, ['ts']),
  ]
})
gulp.task('watch:reload', ['build', 'watch:rebuild'], () => {
  gulp.watch($.globs, () => {
    if ($.spawned) {
      $.spawned.kill()
    }
    var options = process.argv.slice(1, 2),
      count = $.watchers ? $.watchers.length - 1 : 0,
      exec = process.argv[0]

    while (count > 0) {
      $.watchers[count].end().remove()
      count--
    }
    $.watchers = []

    options.push('build')
    options.push('watch:rebuild')
    use.util.log('Reload arguments: %s', options.slice(1))
    $.spawned = require('child_process').spawn(exec, options, {
      cwd: process.cwd(),
      stdio: 'inherit'
    })
  })
})
gulp.task('wiredep', ['html', 'php'])
