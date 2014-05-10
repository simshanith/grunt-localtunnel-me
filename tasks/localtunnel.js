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

  // Matches leading slash.
  var leadingSlashRegex = /^\//;
  // Trim leading slash.
  function trimLeadingSlash(url) {
    if( _.isString(url) ) {
      return url.replace(leadingSlashRegex, '');
    }
  }

  // Unshifts a slash if present then shifts one.
  // Yay idempotency.
  function ensureLeadingSlash(path) {
    if( _.isString(path) ) {
      return trimLeadingSlash(path) + '/';
    }
  }
  grunt.registerMultiTask('localtunnel', 'Expsose local port to public URL via https://localtunnel.me', function() {

    var task = this;
    var done = task.async();

    var defaults = {
      port: 8000,
      subdomain: undefined,
      local_host: undefined,
      open: false,
      keepalive: false,
      handleTunnelError: function(err) {},
      handleTunnelSuccess: function(tunnel) {}
    };

    var options = task.options(defaults);

    // Handlers must be Functions; fallback to default no-op functions.
    // Iterate over array of keys.
    var handlers = ['handleTunnelSuccess', 'handleTunnelError'];
    _.each(handlers, function(handler){
      // References to option as configured & default.
      var option = options[handler];
      var fallback = defaults[handler];

      // Enforce functionality.
      if( !_.isFunction(option) ) {
        grunt.log.error('Localtunnel configuration error: %s should be a function. Using default.', handler);
        option = fallback;
      }
    });

    var supportedOpts = ['subdomain', 'local_host'];
    localtunnel(options.port, _.pick(options, supportedOpts), function(err, tunnel){

      function handleTunnelError(err) {
        grunt.log.error('Uh oh. There was an error with the localtunnel.');
        // task error == 3
        var errorCode = 3;
        grunt.warn(err, errorCode);
      }

      function handleTunnelSuccess(tunnel) {
        grunt.log.ok("Localtunnel available at following url: %s", tunnel.url);
        if( options.open === true ) {
          open(tunnel.url);
        } else if ( _.isString(options.open) ) {
          // need to ensure leading slash.
          open(tunnel.url+ensureLeadingSlash(options.open));
        }
        return tunnel;
      }

      if(err) {
        options.errorCallback(err);
      }

      // Call grunt warn.
      tunnel.on('error', handleTunnelError);
      // Extended functionality via grunt options.
      // May require --force grunt option to override `grunt.warn`.
      tunnel.on('error', options.handleTunnelError);

      // String URL indicates success.
      if( _.isString(tunnel.url) ) {
        handleTunnelSuccess(tunnel);
        options.handleTunnelSuccess(tunnel);

        if( !options.keepalive ) {
          done();
        }
      }

      // end task on close.
      tunnel.on('close', done);
      // close tunnel on exit.
      process.on('exit', tunnel.close.bind(tunnel));

    });
  });
};
