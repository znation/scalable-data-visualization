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
    var width = 630;
    var height = Math.floor(width/2);

    return (
      <div className={'histogram ' + this.props.className}>
        <svg
          width={width + 100}
          height={height + 100}
        >
          <Axis
            scale={
              d3.scale.linear()
                .domain([1, 10].map(function(x) {
                  return x * Math.pow(10, data.bucket) * config.SMALLEST_VALUE;
                }))
                .range([0, width])
            }
            x={100}
            y={height+1}
            axis='x'
          />
          <Axis
            scale={
              d3.scale.linear()
                .domain([d3.min(data.values), data.maxValue])
                .range([height, 0])
            }
            x={99}
            y={0}
            axis='y'
          />
          <Bars
            data={data}
            width={width}
            height={height}
            scales={{
              x: xScale,
              y: yScale
            }}
            zoomIn={this.zoomIn}
          />
        </svg>
      </div>
    );
  }
});
