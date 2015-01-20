'use strict';

var bins = 2060; // hardcoded to accept range of 2060 dates
var histogramBytes = bins * 4;

var config = {
  HISTOGRAM_BINS: bins,
  HISTOGRAM_BYTES: histogramBytes
};

module.exports = {
  config: config
  histogram: function(data) {
    var earliestDate = null;

    return {
      bins:  new Uint32Array(
        data,
        0,
        config.HISTOGRAM_BINS
      ),

      addValue: function(value) {
        if (earliestDate === null) {
          earliestDate = value;
        }
        // find bin relative to earliestDate
        var diff = value.getTime() - earliestDate.getTime();
        var idx = Math.floor(diff / (1000 * 60 * 60 * 24));
        this.bins[idx]++;
      },

      getValues: function() {
        return this.bins;
      }
    };
  }
};
