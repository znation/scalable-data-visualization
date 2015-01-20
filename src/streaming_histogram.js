'use strict';

var numBuckets = 10;
var numBinsPerBucket = 100;
var bins = (numBinsPerBucket * numBuckets) + 1; // supports values up to 10^10
var numHistograms = 1;
var metadataBytes = 8;
var histogramBytes = bins * 4;

var config = {
  SMALLEST_VALUE: 0.01,
  NUM_HISTOGRAMS: numHistograms,
  HISTOGRAM_BINS: bins,
  METADATA_BYTES: metadataBytes, // reserve 8 bytes for range (min,max)
  HISTOGRAM_BYTES: histogramBytes,
  TOTAL_BYTES: (metadataBytes + histogramBytes) * numHistograms,
  NUM_BUCKETS: numBuckets,
  BINS_PER_BUCKET: numBinsPerBucket
};

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
    throw 'value out of range: ' + n;
  }
  // "bin" represents the bin (0-99) within the block
  var bin = Math.floor(((n - Math.pow(10, bucket-2)) / (Math.pow(10, bucket-1) - Math.pow(10, bucket-2))) * config.BINS_PER_BUCKET);
  var ret = (config.BINS_PER_BUCKET * bucket) + bin;
  return ret + 1; // account for the "0" bin (values smaller than SMALLEST_VALUE)
};

module.exports = {
  config: config,
  findBin: findBin,
  histogram: function(data) {
    // create views into bins (Uint32 array of HISTOGRAM_BINS length each)
    return {
      bins: new Uint32Array(
        data,
        config.METADATA_BYTES,
        config.HISTOGRAM_BINS
      ),

      // create views into extrema (Uint32 array of 8 bytes each)
      extrema: new Uint32Array(
        data,
        0,
        config.METADATA_BYTES/4
      ),

      addValue: function(value) {
        this.extrema[0] = Math.min(this.extrema[0], value);
        this.extrema[1] = Math.max(this.extrema[1], value);
        this.bins[findBin(value)]++;
      },

      sumBelowBucket: function(bucket) {
        return d3.sum(
          new Uint32Array(
            data,
            config.METADATA_BYTES,
            (bucket * config.BINS_PER_BUCKET) + 1
          )
        );
      },

      formatHistogram: function(bucketOffset) {
        // return only the bins within the largest bucket,
        // collapsing all smaller buckets into the 1st element of the largest one
        var bucket = findBucket(this.extrema[1]);
        var ret, maxValue;
        if (bucket === 0) {
          // special case, just return the first bucket
          ret = new Uint32Array(
            data,
            config.METADATA_BYTES,
            config.BINS_PER_BUCKET + 1
          );
          maxValue = d3.max(ret);
        } else {
          if (bucketOffset !== undefined) {
            bucket -= bucketOffset;
          }
          // produce a new array of config.BINS_PER_BUCKET+1 values
          var newBuf = new ArrayBuffer((config.BINS_PER_BUCKET+1) * 4);
          var bucketData = new Uint32Array(
            data,
            config.METADATA_BYTES +
              (((config.HISTOGRAM_BINS - 1) * 4) * (bucket / config.NUM_BUCKETS)) + 4,
            config.BINS_PER_BUCKET
          );
          ret = new Uint32Array(newBuf);
          ret[0] = this.sumBelowBucket(bucket);
          for (var i=0; i<config.BINS_PER_BUCKET; i++) {
            ret[i+1] = bucketData[i];
          }
          maxValue = Math.max(
            this.sumBelowBucket(bucket + bucketOffset),
            d3.max(ret)
          );
        }
        return {
          values: ret,
          bucket: bucket,
          maxValue: maxValue
        };
      }
    };
  }
};
