/*
 * grunt-localtunnel-me
 * https://github.com/simshanith/grunt-localtunnel-me
 *
 * Copyright (c) 2014 Shane Daniel
 * Licensed under the MIT license.
 */

'use strict';

var localtunnel = require('localtunnel');
var open = require('open');
var _ = require('lodash');

module.exports = function(grunt) {
  grunt.registerMultiTask('localtunnel', 'Expsose local port to public URL via https://localtunnel.me', function() {

    var done = this.async();

    var options = this.options({
      port: 8000,
      subdomain: undefined,
      local_host: undefined,
      open: false,
      errorCallback: function(err) {
        // task error.
        var errorCode = 3;
        grunt.warn(err, 3);
      }
    });


    var supportedOpts = ['subdomain', 'local_host'];
    localtunnel(options.port, _.pick(options, supportedOpts), function(err, tunnel){

      if(err) {
        options.errorCallback(err);
      }

      tunnel.on('error', function(err) {
        options.errorCallback(err);
      });

      // end task on close.
      tunnel.on('close', function() {
        done();
      });

      // close tunnel on exit.
      process.on('exit', function () {
        tunnel.close();
      });

      if( tunnel.url ) {
        grunt.log.ok("Localtunnel available at following url: %s", tunnel.url);

        if( options.open === true ) {
          open(tunnel.url);
        } else if ( _.isString(options.open) ) {
          open(tunnel.url+options.open);
        }
      }

    });
  });
};
