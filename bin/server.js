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

var process = function (ws) {
  var closed = false;
  ws.on("close", function () {
    console.log("disconnected");
    closed = true;
  });

  // allocate one block of ArrayBuffer for all histograms and extrema
  var data = new ArrayBuffer(config.TOTAL_BYTES);
  var histogram = require("./histogram.js")(data);

  var blockIdx = 0;

  // read the blockchain
  fs.stat("bootstrap.dat", function (err, stats) {
    if (err) {
      throw err;
    }
    // start processing the file
    var totalFileSize = stats.size;
    var stream = fs.createReadStream("bootstrap.dat");
    var bytesRead = 0;
    var previousTenthPct = 0;
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
        var tenthPct = Math.floor(bytesRead / totalFileSize * 1000);
        if (tenthPct !== previousTenthPct) {
          ws.send(new Buffer(new Uint8Array(data)));
          previousTenthPct = tenthPct;
          console.log(tenthPct / 10 + "% complete");
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