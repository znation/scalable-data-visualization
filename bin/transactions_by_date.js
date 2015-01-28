"use strict";

var assert = require("assert");

var bins = 730; // hardcoded to accept range of 730 days (2 years)
var metadataBytes = 2 * 8; // 2 64-bit dates for domain
var histogramBytes = bins * 8;

var config = {
  HISTOGRAM_BINS: bins,
  METADATA_BYTES: metadataBytes,
  TOTAL_BYTES: histogramBytes + metadataBytes
};

module.exports = {
  config: config,
  histogram: function (data) {
    return {
      bins: new Float64Array(data, config.METADATA_BYTES, config.HISTOGRAM_BINS),

      domain: new Float64Array(data, 0, config.METADATA_BYTES / 8),

      getBin: function (time) {
        if (this.domain[0] === 0) {
          // min date not set yet
          return 0;
        }
        // find bin relative to min (assume min value gets bin 0)
        var diff = time - this.domain[0];
        return Math.floor(diff / (1000 * 60 * 60 * 24));
      },

      addValue: function (date, value) {
        var time = date.getTime();
        if (this.domain[0] === 0 || this.domain[0] > time) {
          this.domain[0] = time;
        }
        var idx = this.getBin(time);
        if (idx >= bins) {
          // ignore dates out of range
          return;
        }
        if (this.domain[1] === 0 || this.domain[1] < time) {
          this.domain[1] = time;
        }
        assert(idx >= 0);
        this.bins[idx] += value;
      },

      getValues: function () {
        return this.bins;
      }
    };
  }
};