'use strict';

var React = require('react');

module.exports = React.createClass({
  render: function() {
    var [minX, maxX] = this.props.scale.x.domain();
    var [minY, maxY] = this.props.scale.y.domain();
    return (
      <g>
        <line
          x1={this.props.scale.x(minX) + this.props.x}
          y1={this.props.scale.y(minY) + this.props.y}
          x2={this.props.scale.x(maxX) + this.props.x}
          y2={this.props.scale.y(maxY) + this.props.y}
          stroke='black'
          strokeWidth={2}
        />
      </g>
    );
  }
});
