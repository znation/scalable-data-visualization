'use strict';

// external deps
var React = require('react');

// utility functions
function translate(x, y) {
  return 'translate(' + x + 'px,' + y + 'px)';
}

module.exports = React.createClass({
  render: function() {
    return (
      <g style={{transform: 'translateX(100px)'}}>
        {this.props.values.map(function(value, idx) {
          var click = null;
          if (this.props.bucket !== 0 &&
              idx === 0) {
            // make the first bar clickable, to dive into the results there
            click = this.props.zoomIn;
          }
          return (
            <rect
              fill='#0a8cc4'
              key={idx}
              x={0}
              y={0}
              width={this.props.width/this.props.values.length}
              height={this.props.scales.y(value)}
              style={{
                cursor: click === null ? 'auto' : 'pointer',
                transform: translate(
                  this.props.scales.x(idx),
                  this.props.height - this.props.scales.y(value)
                )
              }}
              onClick={click}
            />
          );
        }.bind(this))}
      </g>
    );
  }
});
