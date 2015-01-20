'use strict';

var React = require('react/addons');
var cx = React.addons.classSet;
var ws = require('ws');

var Histogram = require('./streaming_histogram.jsx');
var config = require('../streaming_histogram.js').config;
var hist = require('../streaming_histogram.js').histogram;

module.exports = React.createClass({
  setActiveTab: function(name) {
    this.setState({activeTab: name});
  },
  getInitialState: function() {
    return { activeTab: 'Transaction Amounts', histogram: hist(config.TOTAL_BYTES) };
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
              {['Transaction Amounts', 'Transaction Amount By Date'].map(function(name, idx) {
                return (
                  <li
                    key={idx}
                    role="presentation"
                    className={cx({active: this.state.activeTab === name})}
                  >
                    <a
                      href="javascript:"
                      onClick={this.setActiveTab.bind(null, name)}
                    >
                      {name}
                    </a>
                  </li>
                );
              }.bind(this))}
            </ul>
            <Histogram
              data={ this.state.histogram }
              name="txAmount"
              className={cx({ hidden: this.state.activeTab !== 'Transaction Amounts' })}
            />
          </div>
        </div>
      </div>
    );
  }
});
