'use strict';

// external deps
var React = require('react');
var ws = require('ws');

// constants
var NUM_HISTOGRAMS = 2;
var HISTOGRAM_BINS = 1000;

var Histogram = React.createClass({
  render: function() {
    var values = this.props.data.values();
    var sum = 0;
    for (let n of values) {
      sum += n;
    };
    return (
      <div>
        {sum}
      </div>
    );
  }
});

var Dashboard = React.createClass({
  getInitialState: function() {
    return { data: new ArrayBuffer(HISTOGRAM_BINS * 4 * 2) };
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
            <Histogram data={new Uint32Array(this.state.data, 0)} />
          </div>
          <div className="col-md-6">
            <Histogram data={new Uint32Array(this.state.data, HISTOGRAM_BINS * 4)} />
          </div>
        </div>
      </div>
    );
  }
});

React.render(<Dashboard />, document.getElementById('demo'));
