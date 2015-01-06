'use strict';

// external deps
var React = require('react');
var ws = require('ws');

// constants
var NUM_HISTOGRAMS = 2;

var Dashboard = React.createClass({
  getInitialState: function() {
    return { data: new ArrayBuffer(2000) };
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
          </div>
        </div>
      </div>
    );
  }
});

React.render(<Dashboard />, document.getElementById('demo'));
