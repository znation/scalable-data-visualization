'use strict';

var React = require('react/addons');
var cx = React.addons.classSet;
var ws = require('ws');

var Histogram = require('./histogram_by_date.jsx');
var config = require('../histogram_by_date.js').config;
var hist = require('../histogram_by_date.js').histogram;

module.exports = React.createClass({
  setActiveTab: function(name) {
    this.setState({activeTab: name});
  },
  getInitialState: function() {
    return {
      activeTab: 'Transaction Amounts',
      histogram: hist(new ArrayBuffer(config.TOTAL_BYTES))
    };
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
            <Histogram
              data={ this.state.histogram }
            />
          </div>
        </div>
      </div>
    );
  }
});
