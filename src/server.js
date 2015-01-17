'use strict';

// external deps
var staticServer = require('node-static');
var ws = require('ws');

// internal deps
var blockchain = require('./blockchain.js');
var config = require('./config.js');

// start up ws server
var WebSocketServer = ws.Server
  , wss = new WebSocketServer({port: 8081});

// allocate one block of ArrayBuffer for all histograms and extrema
var data = new ArrayBuffer(config.TOTAL_BYTES);
var histogram = require('./histogram.js').histogram(data);

var process = function(ws) {
  ws.on('close', function() {
    console.log('disconnected');
    blockchain.close();
  });

  var previousHundredthPct = 0;

  // report first (resume for reset client)
  ws.send(new Buffer(new Uint8Array(data)));
  blockchain.read(function(block, bytesRead, totalSize) {
    block.txs.forEach(function(tx) {
      // get the total tx amount
      var txAmount = tx.outputs.reduce(function(prev, output) {
        return output._satoshis.toNumber();
      }, 0);
      // convert satoshis into bitcoin
      txAmount *= 0.00000001;
      histogram.addValue('txAmount', txAmount);
    });

    // reporting
    var hundredthPct = Math.floor((bytesRead / totalSize) * 10000);
    if (hundredthPct !== previousHundredthPct) {
      ws.send(new Buffer(new Uint8Array(data)));
      previousHundredthPct = hundredthPct;
      console.log((hundredthPct / 100) + '% complete');
    }
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
