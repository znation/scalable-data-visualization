"use strict";

var config = require("./config.js");

function log10(x) {
  return Math.log(x) / Math.LN10;
}

function findBucket(n) {
  if (n === 0) {
    return 0; // avoid -Inf
  }
  return Math.floor(log10(n / config.SMALLEST_VALUE));
};

function findBin(n) {
  // "bucket" represents the block of bins
  // (0.01 - 0.1, 0.1-1, 1-10, 11-100, etc.)
  // SMALLEST_VALUE represents the magnitude of the first bucket
  // each bucket represents one power of ten
  var bucket = findBucket(n);
  if (bucket < 0) {
    // values smaller than SMALLEST_VALUE go into a special 0 bin
    return 0;
  }
  if (bucket > 9) {
    throw "value out of range: " + n;
  }
  // "bin" represents the bin (0-99) within the block
  var bin = Math.floor((n - Math.pow(10, bucket - 2)) / (Math.pow(10, bucket - 1) - Math.pow(10, bucket - 2)) * config.BINS_PER_BUCKET);
  var ret = config.BINS_PER_BUCKET * bucket + bin;
  return ret + 1; // account for the "0" bin (values smaller than SMALLEST_VALUE)
};

function getOffset(name) {
  if (name === "txAmount") {
    return 0;
  }
};

module.exports = {
  findBin: findBin,
  histogram: function (data) {
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

      sumBelowBucket: function (name, bucket) {
        return d3.sum(new Uint32Array(data, getOffset(name) + config.METADATA_BYTES, bucket * config.BINS_PER_BUCKET + 1));
      },

      formatHistogram: function (name, bucketOffset) {
        // return only the bins within the largest bucket,
        // collapsing all smaller buckets into the 1st element of the largest one
        var bucket = findBucket(this.extrema[name][1]);
        if (bucket === 0) {
          // special case, just return the first bucket
          return new Uint32Array(data, getOffset(name) + config.METADATA_BYTES, config.BINS_PER_BUCKET + 1);
        }
        if (bucketOffset !== undefined) {
          bucket -= bucketOffset;
        }
        // produce a new array of config.BINS_PER_BUCKET+1 values
        var newBuf = new ArrayBuffer((config.BINS_PER_BUCKET + 1) * 4);
        var bucketData = new Uint32Array(data, getOffset(name) + config.METADATA_BYTES + (config.HISTOGRAM_BINS - 1) * 4 * (bucket / config.NUM_BUCKETS) + 4, config.BINS_PER_BUCKET);
        var ret = new Uint32Array(newBuf);
        ret[0] = this.sumBelowBucket(name, bucket);
        for (var i = 0; i < config.BINS_PER_BUCKET; i++) {
          ret[i + 1] = bucketData[i];
        }

        var maxValue = Math.max(this.sumBelowBucket(name, bucket + bucketOffset), d3.max(ret));
        return {
          values: ret,
          bucket: bucket,
          maxValue: maxValue
        };
      }
    };
  }
};