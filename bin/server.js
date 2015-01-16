"use strict";

// built in modules
var assert = require("assert");
var fs = require("fs");

// external deps
var binary = require("binary");
var bitcore = require("bitcore");
var staticServer = require("node-static");
var ws = require("ws");

// internal deps
var config = require("./config.js");

// start up ws server
var WebSocketServer = ws.Server, wss = new WebSocketServer({ port: 8081 });

// allocate one block of ArrayBuffer for all histograms and extrema
var data = new ArrayBuffer(config.TOTAL_BYTES);
var histogram = require("./histogram.js")(data);

var blockIdx = 0; // current block

var process = function (ws) {
  var closed = false;
  ws.on("close", function () {
    console.log("disconnected");
    closed = true;
  });

  // report first (resume for reset client)
  ws.send(new Buffer(new Uint8Array(data)));

  // # of blocks to skip (sampling)
  // start at blockIdx to resume when client resets
  var skipBlocks = blockIdx;
  blockIdx = 0;

  // read the blockchain
  fs.stat("bootstrap.dat", function (err, stats) {
    if (err) {
      throw err;
    }
    // start processing the file
    var totalFileSize = stats.size;
    var stream = fs.createReadStream("bootstrap.dat");
    var bytesRead = 0;
    var previousHundredthPct = 0;
    var b = binary().loop(function (end, vars) {
      if (closed) {
        end();
        return;
      }
      this.word8lu("magic1").word8lu("magic2").word8lu("magic3").word8lu("magic4").word32lu("blockSizeWithHeader").buffer("message", "blockSizeWithHeader").tap(function (vars) {
        // message length is in vars.size
        assert.equal(vars.magic1, 249);
        assert.equal(vars.magic2, 190);
        assert.equal(vars.magic3, 180);
        assert.equal(vars.magic4, 217);

        if (skipBlocks === 0) {
          // reset skipBlocks -- skip between 0 and 99 blocks
          skipBlocks = Math.floor(Math.random() * 100);

          // parse out a block using bitcore
          var blockData = new Buffer(8 + vars.blockSizeWithHeader);
          blockData.writeUInt8(vars.magic1, 0);
          blockData.writeUInt8(vars.magic2, 1);
          blockData.writeUInt8(vars.magic3, 2);
          blockData.writeUInt8(vars.magic4, 3);
          blockData.writeUInt32LE(vars.blockSizeWithHeader, 4);
          vars.message.copy(blockData, 8);
          var block = bitcore.Block.fromBuffer(blockData);

          // update histogram bins
          block.txs.forEach(function (tx) {
            // get the total tx amount
            var txAmount = tx.outputs.reduce(function (prev, output) {
              return output._satoshis.toNumber();
            }, 0);
            // convert satoshis into bitcoin
            txAmount *= 1e-8;
            histogram.addValue("txAmount", txAmount);
          });

          // reporting
          bytesRead += block.size + 8; // include header and magic bytes
          var hundredthPct = Math.floor(bytesRead / totalFileSize * 10000);
          if (hundredthPct !== previousHundredthPct) {
            ws.send(new Buffer(new Uint8Array(data)));
            previousHundredthPct = hundredthPct;
            console.log(hundredthPct / 100 + "% complete");
          }
        } else {
          skipBlocks--;
        }

        blockIdx++;
      });
    });
    stream.pipe(b);
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