'use strict';

var bins = 100 * 10; // supports values up to 10^10
var numHistograms = 2;
var metadataBytes = 8;
var histogramBytes = bins * 4;

module.exports = {
  NUM_HISTOGRAMS: numHistograms,
  HISTOGRAM_BINS: bins,
  METADATA_BYTES: metadataBytes, // reserve 8 bytes for range (min,max)
  HISTOGRAM_BYTES: histogramBytes,
  TOTAL_BYTES: (metadataBytes + histogramBytes) * numHistograms
};
