/*
 * grunt-localtunnel-me
 * https://github.com/simshanith/grunt-localtunnel-me
 *
 * Copyright (c) 2014 Shane Daniel
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
  // load all npm grunt tasks
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    localtunnel: {
      compare: {
        options: {
          // default port is 8000
          port: 8000,
          // default subdomain is auto-assigned.
          // Note: may not be available.
          subdomain: 'gruntlocaltunnelme'
        }
      }
    },
    connect: {
      compare: {
        options: {
          port: 8000,
          base: './test'
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // Whenever the "test" task is run, run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['connect', 'localtunnel', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
