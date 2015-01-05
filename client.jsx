'use strict';

var ws = new WebSocket('ws://localhost:8081');
ws.binaryType = "arraybuffer";
ws.onmessage = function(message) {
    console.log('received: %s', message);
};
