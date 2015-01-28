'use strict';

// external deps
var React = require('react');
var d3 = require('d3');
var moment = require('moment');

// internal deps
var Axis = require('./axis.jsx');
var Bars = require('./bars.jsx');

module.exports = React.createClass({
  render: function() {
    var data = this.props.data;
    var values = data.getValues();
    var width = 630;
    var height = Math.floor(width/2);

    if (data.domain[0] === 0) {
      // no data yet
      return (
        <div>
          <span>Loading...&nbsp;</span>
          <span className="glyphicon glyphicon-time" aria-hidden="true"></span>
        </div>
      );
    }

    var scales = {
      x: d3.scale.linear().domain([0, data.getBin(data.domain[1])]).range([0, width]),
      y: d3.scale.linear().domain([0, d3.max(values)]).range([0, height])
    };

    return (
      <div className={'histogram ' + this.props.className}>
        <svg
          width={width + 100}
          height={height + 100}
        >
          <Axis
            scale={scales.x}
            displayScale={
              d3.time.scale.utc()
                .domain([new Date(data.domain[0]), new Date(data.domain[1])])
                .range([0, data.getBin(data.domain[1])])
            }
            tickFormatter={
              function(date) { return moment(date).format('MMM YY'); }
            }
            x={100}
            y={height+1}
            axis='x'
          />
          <Axis
            scale={scales.y}
            displayScale={
              d3.scale.linear().domain([d3.max(values), 0]).range([0, d3.max(values)])
            }
            x={99}
            y={0}
            axis='y'
          />
          <Bars
            data={data}
            width={width}
            height={height}
            scales={scales}
            zoomIn={this.zoomIn}
          />
        </svg>
      </div>
    );
  }
});
