(function() {
  'use strict';

  var pointer = document.createElement('img');
  pointer.setAttribute('src', 'http://localhost:9000/pointer.png'); // TODO don't hardcode URL
  pointer.style.position = 'absolute';
  pointer.style.height = '20px';
  pointer.style.width = '20px';
  pointer.style['z-index'] = 100000;

  var top = 0;
  var left = 0;

  function updatePointerPosition() {
    pointer.style.top = top + 'px';
    pointer.style.left = left + 'px';
  }
  updatePointerPosition();

  var ws = new WebSocket("ws://localhost:9000"); // TODO don't hardcode URL
  ws.onopen = function() {
    console.log("WS connected");
    document.body.appendChild(pointer);
  };
  ws.onmessage = function(msgEvent) {
    console.log("RX: %s", msgEvent.data);

    switch (msgEvent.data) {
      case 'click':
        console.log(document.elementFromPoint(left, top));
        document.elementFromPoint(left - 1, top - 1).click();
        break;
      default:
        var match = /^pos:(-?[0-9]+),(-?[0-9]+)$/.exec(msgEvent.data);
        if (match) {
          top = parseInt(match[2]);
          left = parseInt(match[1]);
          updatePointerPosition();
        } else {
          console.log("(ignored)");
        }
    }
  };

}());
