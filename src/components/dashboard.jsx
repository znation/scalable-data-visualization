'use strict';

var React = require('react');
var ws = require('ws');

var Histogram = require('./streaming_histogram.jsx');
var config = require('../streaming_histogram.js').config;
var hist = require('../streaming_histogram.js').histogram;

module.exports = React.createClass({
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
