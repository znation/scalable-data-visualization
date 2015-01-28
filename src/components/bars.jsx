'use strict';

// external deps
var React = require('react');

// utility functions
function regularArray(typedArray) {
  // TODO -- figure out how to cleanly map over typed arrays
  // without having to copy to a regular array
  var arr = new Array(typedArray.length);
  for (var i=0; i<typedArray.length; i++) {
    arr[i] = typedArray[i];
  }
  return arr;
}
function translate(x, y) {
  return 'translate(' + x + 'px,' + y + 'px)';
}

module.exports = React.createClass({
  render: function() {
    var values = regularArray(this.props.data.getValues());
    return (
      <g style={{transform: 'translateX(100px)'}}>
        {values.map(function(value, idx) {
          var click = null;
          if (this.props.data.bucket !== 0 &&
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
              width={this.props.width/values.length}
              height={1} /* size with CSS transform to allow transitions */
              style={{
                cursor: click === null ? 'auto' : 'pointer',
                transform: translate(
                  this.props.scales.x(idx),
                  this.props.height - this.props.scales.y(value)
                ) + ' scaleY(' + this.props.scales.y(value) + ')'
              }}
              onClick={click}
            />
          );
        }.bind(this))}
      </g>
    );
  }
});
