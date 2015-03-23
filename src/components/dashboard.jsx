'use strict';

var React = require('react/addons');
var cx = React.addons.classSet;
var ws = require('ws');

var Histogram = require('./transactions_by_date.jsx');
var History = require('./history.jsx');
var config = require('../transactions_by_date.js').config;
var hist = require('../transactions_by_date.js').histogram;

module.exports = React.createClass({
  getInitialState: function() {
    return {
      histogram: hist(new ArrayBuffer(config.TOTAL_BYTES)),
      hoverDate: null
    };
  },
  onHover: function(date) {
    this.setState({hoverDate: date});
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
            <h2>Total Bitcoin transaction amount per day</h2>
          </div>
        </div>
        <br />
        <div className="row">
          <div className="col-xs-12">
            <Histogram
              data={ this.state.histogram }
              highlightIdx={
                this.state.hoverDate === null ? null : (
                  Math.floor((this.state.hoverDate - (new Date(this.state.histogram.domain[0]))) / (1000 * 60 * 60 * 24))
                )
              }
            />
          </div>
          <div className="col-xs-12">
            <History
              now={ this.state.histogram.domain[1] }
              onHover={this.onHover}
              hoverDate={this.state.hoverDate}
            />
          </div>
        </div>
      </div>
    );
  }
});
