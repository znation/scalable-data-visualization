'use strict';

// internal deps
var blockchain = require('./blockchain.js');

var blockIdx = 0;
blockchain.read(function(block, bytesRead, bytesTotal) {
  var txs = [];
  block.txs.forEach(function(tx, idx) {
    // get the total tx amount
    var txAmount = tx.outputs.reduce(function(prev, output) {
      return output._satoshis.toNumber();
    }, 0);
    // convert satoshis into bitcoin
    txAmount *= 0.00000001;
    txs.push(txAmount);
  });
  console.log(blockIdx + ',' + JSON.stringify(txs) + ',' + (new Date(block.header.time * 1000)));
  blockIdx++;
}, 1);
