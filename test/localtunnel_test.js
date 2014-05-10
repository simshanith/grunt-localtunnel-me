/*

Portions taken from https://github.com/gruntjs/grunt-contrib-connect

Copyright (c) 2014 "Cowboy" Ben Alman, contributors

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

'use strict';

var grunt = require('grunt');
var http = require('http');
var https = require('https');
var Q = require('Q');
var _ = require('lodash');

function get(url, done) {
  var client = http;
  if ((typeof url === 'string' && url.toLowerCase().indexOf('https') === 0) ||
    (typeof url === 'object' && url.port === 443) ||
    (typeof url === 'object' && url.scheme === 'https')) {
    client = https;
    delete url.scheme;
  }
  client.get(url, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    }).on('end', function() {
      done(res, body);
    });
  });
}

exports.localtunnel = {
  setUp: function (done) {
    // setup here if necessary
    done();
  },
  compare: function (test) {
    test.expect(4);

    function assertions(localRes, localBody, tunnelRes, tunnelBody) {
      test.equal(localRes.statusCode, 200, 'local server should return 200');
      test.equal(tunnelRes.statusCode, 200, 'tunnel server should return 200');
      test.equal(localBody, 'Hello World', 'local should return static page');
      test.equal(tunnelBody, localBody, 'tunnel should return same');
      test.done();
    }

    var localDeferred = new Q.defer();
    var tunnelDeferred = new Q.defer();
    var allDone = Q.all([localDeferred.promise, tunnelDeferred.promise]);

    allDone.then(function(resolution){
      return new Q(_.flatten(resolution));
    }).spread(assertions);

    get({
      hostname: 'localhost',
      port: 8000,
      path: '/fixtures/hello.txt',
      headers: {
        accept: 'text/plain',
      }
    }, function(res, body) {
      localDeferred.resolve([res, body]);
    });
    get({
      scheme: 'https',
      hostname: 'gruntlocaltunnelme.localtunnel.me',
      port: 443,
      path: '/fixtures/hello.txt',
      headers: {
        accept: 'text/plain'
      }
    }, function(res, body) {
      tunnelDeferred.resolve([res, body]);
    });
  }
};
