'use strict';

var React = require('react');

module.exports = React.createClass({
  render: function() {
    var axis = this.props.axis;
    var other = this.props.axis === 'x' ? 'y' : 'x';
    var tickOffsetAxis = this.props.axis === 'x' ? 0 : 5;
    var tickOffsetOther = this.props.axis === 'x' ? 24 : -16;
    var tickLength = this.props.axis === 'x' ? 8 : -8;
    var scale = this.props.scale;
    var displayScale = this.props.displayScale || d3.scale.identity();
    var tickFormatter = this.props.tickFormatter || d3.scale.identity();
    var [min, max] = scale.domain();
    var axisLineProps = {
      stroke: 'black',
      strokeWidth: 2
    };
    axisLineProps[axis + '1'] = scale(min) + this.props[axis];
    axisLineProps[axis + '2'] = scale(max) + this.props[axis];
    axisLineProps[other + '1'] = this.props[other];
    axisLineProps[other + '2'] = this.props[other];
    var axisLine = React.DOM.line(axisLineProps);
    return (
      <g>
        {axisLine}
        {displayScale.nice(6).ticks(6).map(function(tick, idx) {
          var lineProps = {
            stroke: 'black',
            strokeWidth: 2
          };
          lineProps[axis + '1'] = scale(displayScale(tick)) + this.props[axis];
          lineProps[axis + '2'] = scale(displayScale(tick)) + this.props[axis];
          lineProps[other + '1'] = this.props[other];
          lineProps[other + '2'] = this.props[other] + tickLength;
          var line = React.DOM.line(lineProps);
          var labelProps = {
            textAnchor: axis === 'x' ? 'middle' : 'end'
          };
          labelProps[axis] = scale(displayScale(tick)) + this.props[axis] + tickOffsetAxis;
          labelProps[other] = this.props[other] + tickOffsetOther;
          var label = React.DOM.text(labelProps, tickFormatter(tick));
          return (
            <g key={idx}>
              {line}
              {label}
            </g>
          );
        }.bind(this))}
      </g>
    );
  }
});
