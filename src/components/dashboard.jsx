'use strict';

var React = require('react/addons');
var cx = React.addons.classSet;
var ws = require('ws');

var Histogram = require('./streaming_histogram.jsx');
var config = require('../streaming_histogram.js').config;
var hist = require('../streaming_histogram.js').histogram;

module.exports = React.createClass({
  getInitialState: function() {
    return { activeTab: 'txAmount', histogram: hist(config.TOTAL_BYTES) };
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
            <ul className="nav nav-tabs" style={{marginBottom: 20}}>
              <li
                role="presentation"
                className={cx({active: this.state.activeTab === 'txAmount'})}
              >
                <a
                  href="javascript:"
                  onClick={this.setState.bind(null, {activeTab:'txAmount'})}
                >
                  Transaction Amounts
                </a>
              </li>
            </ul>
            <Histogram
              data={ this.state.histogram }
              name="txAmount"
              className={cx({ hide: this.state.activeTab !== 'txAmount' })}
            />
          </div>
        </div>
      </div>
    );
  }
});
