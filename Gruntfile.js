
/*!
 * cranberry's Gruntfile
 * http://getcranberry.com
 * Copyright 2013-2016 The cranberry Authors
 * Copyright 2013-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/royswastik/cranberry/master/LICENSE)
 */

module.exports = function (grunt) {
  'use strict';

  // Force use of Unix newlines
  grunt.util.linefeed = '\n';

  RegExp.quote = function (string) {
    return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  /*var fs = require('fs');*/
  var path = require('path');

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*!\n' +
            ' * Cranberry v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
            ' * Copyright 2011-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
            ' * Licensed under MIT (https://github.com/royswastik/cranberry)\n' +
            ' */\n',
    // Task configuration.
    clean: {
      dist: 'dist'
    },

  
    // CSS build configuration
    scsslint: {
      options: {
        bundleExec: true,
        config: 'scss/.scss-lint.yml',
        reporterOutput: null
      },
      core: {
        src: ['scss/*.scss', '!scss/_normalize.scss']
      }
    },

    cssmin: {
      options: {
        // TODO: disable `zeroUnits` optimization once clean-css 3.2 is released
        //    and then simplify the fix for https://github.com/twbs/cranberry/issues/14837 accordingly
        compatibility: 'ie9',
        keepSpecialComments: '*',
        sourceMap: true,
        advanced: false
      },
      core: {
        files: [
          {
            expand: true,
            cwd: 'dist/css',
            src: ['*.css', '!*.min.css'],
            dest: 'dist/css',
            ext: '.min.css'
          }
        ]
      }
    },

    copy: {
      docs: {
        expand: true,
        cwd: 'dist/',
        src: [
          '**/*'
        ],
        dest: 'docs/dist/'
      }
    },



    exec: {
      postcss: {
        command: 'npm run postcss'
      },
      'postcss-docs': {
        command: 'npm run postcss-docs'
      },
    },


    compress: {
      main: {
        options: {
          archive: 'cranberry-<%= pkg.version %>-dist.zip',
          mode: 'zip',
          level: 9,
          pretty: true
        },
        files: [
          {
            expand: true,
            cwd: 'dist/',
            src: ['**'],
            dest: 'cranberry-<%= pkg.version %>-dist'
          }
        ]
      }
    }

  });


  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt, { scope: 'devDependencies',
    // Exclude Sass compilers. We choose the one to load later on.
    pattern: ['grunt-*', '!grunt-sass', '!grunt-contrib-sass'] });
  require('time-grunt')(grunt);



  grunt.registerTask('test-scss', ['scsslint:core']);

  // CSS distribution task.
  // Supported Compilers: sass (Ruby) and libsass.
  (function (sassCompilerName) {
    require('./grunt/sass-compile/' + sassCompilerName + '.js')(grunt);
  })('libsass');
  // grunt.registerTask('sass-compile', ['sass:core', 'sass:extras', 'sass:docs']);
  grunt.registerTask('sass-compile', ['sass:core', 'sass:docs']);

  grunt.registerTask('dist-css', ['sass-compile', 'exec:postcss', 'cssmin:core']);

  grunt.registerTask('dist-css-grid', ['sass:grid']);

  // Full distribution task.
  grunt.registerTask('dist', ['clean:dist', 'dist-css', 'dist-js']);

  // Default task.
  grunt.registerTask('default', ['clean:dist']);
};
