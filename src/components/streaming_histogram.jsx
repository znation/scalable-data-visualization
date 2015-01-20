'use strict';

// external deps
var React = require('react');
var d3 = require('d3');

// internal deps
var Axis = require('./axis.jsx');
var Bars = require('./bars.jsx');
var config = require('../streaming_histogram.js').config;

module.exports = React.createClass({
  /* component functions */
  zoom: function(amt) {
    this.setState({ bucketOffset: this.state.bucketOffset + amt });
  },
  /* event handlers */
  preventDefault: function(evt) {
    // used on component to prevent text selection via double-click
    evt.preventDefault();
  },
  zoomIn: function(evt) {
    evt.stopPropagation();
    this.zoom(1);
  },
  zoomOut: function(evt) {
    evt.stopPropagation();
    this.zoom(-1);
  },
  /* react lifecycle methods */
  getInitialState: function() {
    return { bucketOffset: 0 };
  },
  render: function() {
    var data = this.props.data.formatHistogram(this.state.bucketOffset);

    var width = 630;
    var height = Math.floor(width/2);
    var xScale = d3.scale.linear()
      .domain([0, data.values.length])
      .range([0, width]);
    var yScale = d3.scale.linear()
      .domain([d3.min(data.values), data.maxValue])
      .range([0, height]);
    return (
      <div
        className={'histogram ' + this.props.className}
        onMouseDown={this.preventDefault}>
        <p>
          {data.bucket ? (
            <span>
              Viewing at 10^{data.bucket} scale.
            </span>
          ) : <span>Loading...</span>}
          {this.state.bucketOffset === 0 ? null : (
            <span>&nbsp;(
              <a
                href="javascript:"
                onClick={this.zoomOut}
              >
                Zoom Out
              </a>
            )</span>
          )}
        </p>
        <svg
          width={width + 100}
          height={height + 100}
        >
          <Axis
            scale={
              d3.scale.linear()
                .domain([1, 10].map(function(x) {
                  return x * Math.pow(10, data.bucket) * config.SMALLEST_VALUE;
                }))
                .range([0, width])
            }
            x={100}
            y={height+1}
            axis='x'
          />
          <Axis
            scale={
              d3.scale.linear()
                .domain([d3.min(data.values), data.maxValue])
                .range([height, 0])
            }
            x={99}
            y={0}
            axis='y'
          />
          <Bars
            data={data}
            width={width}
            height={height}
            scales={{
              x: xScale,
              y: yScale
            }}
            zoomIn={this.zoomIn}
          />
        </svg>
      </div>
    );
  }
});
