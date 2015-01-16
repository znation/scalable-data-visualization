"use strict";

var numBuckets = 10;
var bins = 100 * numBuckets + 1; // supports values up to 10^10
var numHistograms = 1;
var metadataBytes = 8;
var histogramBytes = bins * 4;

module.exports = {
  SMALLEST_VALUE: 0.01,
  NUM_HISTOGRAMS: numHistograms,
  HISTOGRAM_BINS: bins,
  METADATA_BYTES: metadataBytes, // reserve 8 bytes for range (min,max)
  HISTOGRAM_BYTES: histogramBytes,
  TOTAL_BYTES: (metadataBytes + histogramBytes) * numHistograms,
  NUM_BUCKETS: numBuckets
};