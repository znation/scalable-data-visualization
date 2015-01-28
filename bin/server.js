"use strict";

// external deps
var staticServer = require("node-static");
var ws = require("ws");

// internal deps
var blockchain = require("./blockchain.js");
var config = require("./transactions_by_date.js").config;

// start up ws server
var WebSocketServer = ws.Server, wss = new WebSocketServer({ port: 8081 });

// allocate one block of ArrayBuffer for all histograms and extrema
var data = new ArrayBuffer(config.TOTAL_BYTES);
var histogram = require("./transactions_by_date.js").histogram(data);

// utility functions
function compareDates(d1, d2) {
  var onlyDate = [d1, d2].map(function (d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  });
  return onlyDate[0] === onlyDate[1];
}

// run on WebSocket open
var process = function (ws) {
  ws.on("close", function () {
    console.log("disconnected");
    blockchain.close();
  });

  var previousInterval = 0;

  // report first (resume for reset client)
  ws.send(new Buffer(new Uint8Array(data)));

  // build a histogram of tx amount / date, for all blocks
  blockchain.read(function (block, bytesRead, totalSize) {
    var txAmount = 0;

    block.txs.forEach(function (tx) {
      // get the total tx amount
      var txAmtThisBlock = tx.outputs.reduce(function (prev, output) {
        return output._satoshis.toNumber();
      }, 0);
      // convert satoshis into bitcoin
      txAmtThisBlock *= 1e-8;
      txAmount += txAmtThisBlock;
    });

    var currentDate = new Date(block.header.time * 1000);
    // update histogram of txAmt per day
    histogram.addValue(currentDate, txAmount);

    // reporting
    var interval = Math.floor(bytesRead / totalSize * 40000);
    if (interval !== previousInterval) {
      ws.send(new Buffer(new Uint8Array(data)));
      previousInterval = interval;
      console.log(interval / 400 + "% complete at " + currentDate);
    }
  });
};

wss.on("connection", function (ws) {
  ws.on("message", function (message) {
    console.log("received: %s", message);
  });
  console.log("connected");
  process(ws);
});

// Create a node-static server instance to serve the '.' folder
var file = new staticServer.Server(".");
require("http").createServer(function (request, response) {
  request.addListener("end", function () {
    // Serve files!
    file.serve(request, response);
  }).resume();
}).listen(8080);