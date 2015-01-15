"use strict";

var config = require("./config.js");

function log10(x) {
  return Math.log(x) / Math.LN10;
}

function findBin(n) {
  // "bucket" represents the block of bins
  // (1-10, 11-100, etc.)
  var bucket = Math.floor(log10(n));
  if (bucket > 9) {
    throw "value out of range: " + n;
  }
  // "bin" represents the bin (0-99) within the block
  var bin = Math.round((n - Math.pow(10, bucket)) / (Math.pow(10, bucket + 1) - Math.pow(10, bucket)) * 100);
  var ret = Math.pow(10, bucket) + bin;
  return ret;
};

module.exports = function (data) {
  // create views into bins (Uint32 array of HISTOGRAM_BINS length each)
  return {
    bins: {
      blockSize: new Uint32Array(data, config.METADATA_BYTES, config.HISTOGRAM_BINS),
      numTransactions: new Uint32Array(data, config.METADATA_BYTES * 2 + config.HISTOGRAM_BINS, config.HISTOGRAM_BINS)
    },

    // create views into extrema (Uint32 array of 8 bytes each)
    extrema: {
      blockSize: new Uint32Array(data, 0, config.METADATA_BYTES),
      numTransactions: new Uint32Array(data, config.METADATA_BYTES + config.HISTOGRAM_BINS, config.METADATA_BYTES)
    },

    addValue: function (name, value) {
      this.extrema[name][0] = Math.min(this.extrema[name][0], value);
      this.extrema[name][1] = Math.max(this.extrema[name][1], value);
      this.bins[name][findBin(value)]++;
    },

    /*
    this.getMin = function(name) {
      return this.extrema[name][0];
    };
     this.getMax = function(name) {
      return this.extrema[name][1];
    };
    */

    getValues: function (name) {
      // TODO postprocess bins to get values that make sense
      return this.bins[name];
    }
  };
};