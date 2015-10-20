(function() {
  'use strict';

  // TODO: store/retrieve channel in session storage
  var channel = (prompt("Enter channel to join", "") || "");

  var pointer = document.createElement('img');
  // Pointer tinkered from:
  // https://openclipart.org/detail/222076/white-mouse-cursor-arrow
  pointer.setAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAUCAMAAACzvE1FAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3woUByEHrcNK9gAAAH5QTFRF9vb2%2F%2F%2F%2F6urqAQEBEhISFhYWFxcXLS0tMjIyNDQ0ODg4Pj4%2BRUVFSUlJS0tLT09PWFhYXl5eX19fcnJydXV1jo6Oj4%2BPkpKSmJiYmZmZm5ubn5%2BfoqKiqampsrKywsLCw8PDxcXFzs7O0tLS2tra3Nzc5%2Bfn9%2Ff3%2Bfn5%2F%2F%2F%2FDUkwHwAAAAN0Uk5TAADMaKRKRQAAAAFiS0dEKcq3hSQAAAB0SURBVBjTZdBHEoMwEETRaRxIDmRrnMAkw%2F0vyAIxCPGXb9NVTbAiAC8bDsoC7662EAyGEIBgNGQGQzSssoCIwCIraBH4MD%2BOSuD3TxNmfpKG6vTubsZK5TfheG0Fzl6PqP5mAq4DlHHuCjgAcClIYPfYpgmojQvVxGP2NgAAAABJRU5ErkJggg%3D%3D');
  pointer.style.position = 'absolute';
  pointer.style.height = '20px';
  pointer.style.width = '16px';
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
    ws.send("join:" + channel);
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
