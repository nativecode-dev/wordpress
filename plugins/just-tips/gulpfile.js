/// <reference path="typings/index.d.ts" />
'use strict';

var bower = require('gulp-bower'),
  config = JSON.parse(require('fs').readFileSync('config.json')),
  deploy = config.deployments[process.env.environment || 'development'],
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
  return gulp.src(config.zip.include)
    .pipe(use.plumber())
    .pipe(use.zip(npm.name + '.' + npm.version + '.zip'))
    .pipe(gulp.dest(config.dist))
})

gulp.task('deploy:clean', () => {
  return $ssh().exec(['rm -rf ' + deploy.ssh.path], { filePath: 'deploy-clean.log' })
    .pipe(gulp.dest(config.logs.target))
})
gulp.task('deploy:files', ['deploy:clean', 'package'], () => {
  return gulp.src(deploy.globs)
    .pipe(use.plumber())
    .pipe($ssh().dest(deploy.ssh.path))
})
gulp.task('deploy', ['deploy:files'], () => {
  return $ssh()
    .exec([
      'chown -R www-data:www-data ' + deploy.ssh.path,
      'unzip -o ' + deploy.ssh.path + '/' + '*.zip -d ' + deploy.ssh.path + '/'
    ], { filePath: 'deploy-push.log' })
    .pipe(gulp.dest(config.logs.target))
})

gulp.task('shrinkwrap', ['build'], () => {
  return gulp.src('package.json')
    .pipe(use.plumber())
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
  npm = JSON.parse(require('fs').readFileSync('package.json'))
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
    var options = process.argv.slice(1, 2),
      count = config.watchers ? config.watchers.length - 1 : 0,
      exec = process.argv[0]

    while (count > 0) {
      config.watchers[count].end().remove()
      count--
    }
    config.watchers = []

    options.push('watch:rebuild')
    config.spawned = require('child_process').spawn(exec, options, {
      cwd: process.cwd(),
      stdio: 'inherit'
    })
  })
})
gulp.task('wiredep', ['html', 'php'])
