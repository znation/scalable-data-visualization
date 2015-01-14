'use strict';

// built in modules
var assert = require('assert');
var fs = require('fs');

// external deps
var binary = require('binary');
var staticServer = require('node-static');
var ws = require('ws');

// start up ws server
var WebSocketServer = ws.Server
  , wss = new WebSocketServer({port: 8081});

var binCount = 100 * 10; // supports values up to 10^10
var data = new ArrayBuffer(binCount * 4);
var bins = new Uint32Array(data, 0);
function log10(x) {
  return Math.log(x) / Math.LN10;
}
var findBin = function(n) {
  // "bucket" represents the block of bins
  // (1-10, 11-100, etc.)
  var bucket = Math.floor(log10(n));
  if (bucket > 9) {
    throw 'value out of range: ' + n;
  }
  // "bin" represents the bin (0-99) within the block
  var bin = Math.round(((n - Math.pow(10, bucket)) / (Math.pow(10, bucket+1) - Math.pow(10, bucket))) * 100);
  return Math.pow(10, bucket) + bin;
};

var process = function(ws) {
  var closed = false;
  ws.on('close', function() {
    console.log('disconnected');
    closed = true;
  });
  fs.stat('bootstrap.dat', function(err, stats) {
    if (err) { throw err; }
    // start processing the file
    var totalFileSize = stats.size;
    var stream = fs.createReadStream('bootstrap.dat');
    var header = new Buffer([0xf9, 0xbe, 0xb4, 0xd9]);
    var bytesRead = 0;
    var previousHundredthPct = 0;
    var b = binary()
      .loop(function(end, vars) {
        if (closed) {
          end();
          return;
        }
        this
          .scan('message', header)
          .tap(function(vars) {
            if (vars.message.length === 0) {
              // empty message, should only happen on the first one
              return;
            }
            // make sure size (as reported by contents) matches parsed size
            var size = binary.parse(vars.message).word32lu('size').vars.size;
            assert(vars.message.length - size - 4 === 0);

            // update histogram bins
            bins[findBin(vars.message.length)]++;

            // reporting
            bytesRead += (vars.message.length + 4); // include header
            var hundredthPct = Math.floor((bytesRead / totalFileSize) * 10000);
            if (hundredthPct !== previousHundredthPct) {
              ws.send(new Buffer(new Uint8Array(data)));
              previousHundredthPct = hundredthPct;
              console.log((hundredthPct / 100) + '% complete');
            }
          });
      });
    stream.pipe(b);
  });
};

wss.on('connection', function(ws) {
  ws.on('message', function(message) {
    console.log('received: %s', message);
  });
  console.log('connected');
  process(ws);
});

// Create a node-static server instance to serve the '.' folder
var file = new staticServer.Server('.');
require('http').createServer(function (request, response) {
  request.addListener('end', function () {
    // Serve files!
    file.serve(request, response);
  }).resume();
}).listen(8080);
