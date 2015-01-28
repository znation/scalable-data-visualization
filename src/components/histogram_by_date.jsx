'use strict';

// external deps
var React = require('react');
var d3 = require('d3');

// internal deps
var Axis = require('./axis.jsx');
var Bars = require('./bars.jsx');

module.exports = React.createClass({
  render: function() {
    var data = this.props.data;
    var values = data.getValues();
    var width = 630;
    var height = Math.floor(width/2);

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
              d3.scale.linear()
                .domain([0, data.getBin(data.domain[1])])
                .range([new Date(data.domain[0]), new Date(data.domain[1])])
            }
            x={100}
            y={height+1}
            axis='x'
          />
          <Axis
            scale={scales.y}
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
