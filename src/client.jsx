'use strict';

// external deps
var React = require('react');
var d3 = require('d3');
var ws = require('ws');

// internal deps
var config = require('./config.js');
var hist = require('./histogram.js');

// utility functions
function regularArray(typedArray) {
  var arr = new Array(typedArray.length);
  for (var i=0; i<typedArray.length; i++) {
    arr[i] = typedArray[i];
  }
  return arr;
}
function translate(x, y) {
  return 'translate(' + x + 'px,' + y + 'px)';
}

// React components
var Histogram = React.createClass({
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
    // TODO -- figure out how to cleanly map over typed arrays
    // without having to copy to a regular array
    var data = this.props.data.formatHistogram(this.props.name, this.state.bucketOffset);
    var values = regularArray(data.values);

    var width = 606;
    var height = Math.floor(width/4);
    var xScale = d3.scale.linear()
      .domain([0, values.length])
      .range([0, width]);
    var yScale = d3.scale.linear()
      .domain([d3.min(values), d3.max(values)])
      .range([0, height]);
    return (
      <div className="histogram" onMouseDown={this.preventDefault}>
        <div className="zoomControls">
          Viewing at 10^{data.bucket} scale.
          {this.state.bucketOffset === 0 ? null : (
            <a
              className="btn btn-default"
              onClick={this.zoomOut}
            >
              Zoom Out
            </a>
          )}
        </div>
        <svg
          width={width}
          height={height}
        >
          {values.map(function(value, idx) {
            var click = null;
            if (data.bucket !== 0 &&
                idx === 0) {
              // make the first bar clickable, to dive into the results there
              click = this.zoomIn;
            }
            return (
              <rect
                fill='#0a8cc4'
                key={idx}
                x={0}
                y={0}
                width={width/values.length}
                height={yScale(value)}
                style={{
                  cursor: click === null ? 'auto' : 'pointer',
                  transform: translate(xScale(idx), height - yScale(value))
                }}
                onClick={click}
              />
            );
          }.bind(this))}
        </svg>
      </div>
    );
  }
});

var Dashboard = React.createClass({
  getInitialState: function() {
    return { histogram: hist(config.TOTAL_BYTES) };
  },
  componentDidMount: function() {
    var wsc = new ws('ws://localhost:8081');
    wsc.binaryType = 'arraybuffer';
    wsc.onmessage = function(message) {
      this.setState({ histogram: hist(message.data) });
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
          <div className="col-xs-12">
            <Histogram data={ this.state.histogram } name="txAmount" />
          </div>
        </div>
      </div>
    );
  }
});

React.render(<Dashboard />, document.getElementById('demo'));
