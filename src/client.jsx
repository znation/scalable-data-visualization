'use strict';

// external deps
var React = require('react');
var d3 = require('d3');
var ws = require('ws');

// internal deps
var config = require('./config.js');

// utility functions
function regularArray(typedArray) {
  var arr = new Array(typedArray.length);
  for (var i=0; i<typedArray.length; i++) {
    arr[i] = typedArray[i];
  }
  return arr;
}

// React components
var Histogram = React.createClass({
  render: function() {
    // TODO -- figure out how to cleanly map over typed arrays
    // without having to copy to a regular array
    var values = regularArray(this.props.data);
    var width = 400;
    var height = 300;
    var xScale = d3.scale.linear()
      .domain([0, values.length])
      .range([0, width]);
    var yScale = d3.scale.linear()
      .domain([d3.min(values), d3.max(values)])
      .range([0, height]);
    return (
      <svg
        width={width}
        height={height}
      >
        {values.map(function(value, idx) {
          return (
            <rect
              fill='#0a8cc4'
              x={xScale(idx)}
              width={width/values.length}
              y={height - yScale(value)}
              height={yScale(value)}
              key={idx}
            />
          );
        }.bind(this))}
      </svg>
    );
  }
});

var Dashboard = React.createClass({
  getInitialState: function() {
    return { data: new ArrayBuffer(config.HISTOGRAM_BYTES * config.NUM_HISTOGRAMS) };
  },
  componentDidMount: function() {
    var wsc = new ws('ws://localhost:8081');
    wsc.binaryType = 'arraybuffer';
    wsc.onmessage = function(message) {
      this.setState({data: message.data});
    }.bind(this);
  },
  render: function() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-xs-12">
            <h1>Scalable Data Visualization</h1>
            <h2>Visualizing the Bitcoin Blockchain</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <Histogram data={new Uint32Array(this.state.data, 0, config.HISTOGRAM_BINS)} />
          </div>
          <div className="col-md-6">
            {/*
            <Histogram data={new Uint32Array(this.state.data, config.HISTOGRAM_BINS, config.HISTOGRAM_BINS)} />
            */}
          </div>
        </div>
      </div>
    );
  }
});

React.render(<Dashboard />, document.getElementById('demo'));
