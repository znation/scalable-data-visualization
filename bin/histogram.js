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
  var ret = 100 * bucket + bin;
  return ret;
};

function getOffset(name) {
  if (name === "txAmount") {
    return 0;
  }
};

module.exports = function (data) {
  // create views into bins (Uint32 array of HISTOGRAM_BINS length each)
  return {
    bins: {
      txAmount: new Uint32Array(data, getOffset("txAmount") + config.METADATA_BYTES, config.HISTOGRAM_BINS)
    },

    // create views into extrema (Uint32 array of 8 bytes each)
    extrema: {
      txAmount: new Uint32Array(data, getOffset("txAmount"), config.METADATA_BYTES / 4)
    },

    addValue: function (name, value) {
      this.extrema[name][0] = Math.min(this.extrema[name][0], value);
      this.extrema[name][1] = Math.max(this.extrema[name][1], value);
      this.bins[name][findBin(value)]++;
    },

    getValues: function (name) {
      // return only the bins within the largest bucket,
      // collapsing all smaller buckets into the 1st element of the largest one
      var bucket = Math.floor(log10(this.extrema[name][1]));
      if (bucket === 0) {
        // special case, just return the first bucket
        return new Uint32Array(data, getOffset(name) + config.METADATA_BYTES, config.HISTOGRAM_BINS);
      }
      var allValuesBelowBucket = d3.sum(new Uint32Array(data, getOffset(name) + config.METADATA_BYTES, bucket * 100));
      // produce a new array of 101 values
      var newBuf = new ArrayBuffer(101 * 4);
      var bucketData = new Uint32Array(data, getOffset(name) + config.METADATA_BYTES + 400 * bucket, 100);
      var ret = new Uint32Array(newBuf);
      ret[0] = allValuesBelowBucket;
      for (var i = 0; i < 100; i++) {
        ret[i + 1] = bucketData[i];
      }
      return ret;
    }
  };
};