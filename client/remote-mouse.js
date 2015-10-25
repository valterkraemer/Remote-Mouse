(function() {
  'use strict';

  // TODO:
  // If we already have a socket/session open, this will open a new one.
  // Is that a bug or a feature?

  var channel = (sessionStorage.getItem("remote-mouse-last-channel") || "");
  channel = (prompt("Enter channel to join", channel) || "");

  var pointer = document.createElement('img');
  // Pointer tinkered from:
  // https://openclipart.org/detail/222076/white-mouse-cursor-arrow
  pointer.setAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAUCAMAAACzvE1FAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3woUByEHrcNK9gAAAH5QTFRF9vb2%2F%2F%2F%2F6urqAQEBEhISFhYWFxcXLS0tMjIyNDQ0ODg4Pj4%2BRUVFSUlJS0tLT09PWFhYXl5eX19fcnJydXV1jo6Oj4%2BPkpKSmJiYmZmZm5ubn5%2BfoqKiqampsrKywsLCw8PDxcXFzs7O0tLS2tra3Nzc5%2Bfn9%2Ff3%2Bfn5%2F%2F%2F%2FDUkwHwAAAAN0Uk5TAADMaKRKRQAAAAFiS0dEKcq3hSQAAAB0SURBVBjTZdBHEoMwEETRaRxIDmRrnMAkw%2F0vyAIxCPGXb9NVTbAiAC8bDsoC7662EAyGEIBgNGQGQzSssoCIwCIraBH4MD%2BOSuD3TxNmfpKG6vTubsZK5TfheG0Fzl6PqP5mAq4DlHHuCjgAcClIYPfYpgmojQvVxGP2NgAAAABJRU5ErkJggg%3D%3D');
  pointer.style.position = 'absolute';
  pointer.style.height = '20px';
  pointer.style.width = '16px';
  pointer.style['z-index'] = 100000;

  pointer.style.left = '100px';
  pointer.style.top = '100px';

  var pixelStep = 10;

  var url = ((window.location.protocol === "https:") ? "wss:" : "ws:") + window.__remoteMouseBaseUrl;
  var ws = new WebSocket(url);

  ws.onopen = function() {
    console.log("WS connected");
    ws.send("register:" + channel);
    sessionStorage.setItem("remote-mouse-last-channel", channel);
    document.body.appendChild(pointer);
  };

  ws.onmessage = function(msgEvent) {
    var message = msgEvent.data;
    console.log('RX: ', message);

    var parts = message.split(':');

    if (parts.length !== 2) {
      return console.log('Not valid message');
    }

    var type = parts[0];
    var value = parts[1];


    switch (type) {
      case 'click':
        console.log('click');
        document.elementFromPoint(parsePx(pointer.style.left) - 1, parsePx(pointer.style.top) - 1).click();
        break;
      case 'step':
        switch (value) {
          case 'left':
            pointer.style.left = (parsePx(pointer.style.left) - pixelStep) + 'px';
            break;
          case 'up':
            pointer.style.top = (parsePx(pointer.style.top) - pixelStep) + 'px';
            break;
          case 'right':
            pointer.style.left = (parsePx(pointer.style.left) + pixelStep) + 'px';
            break;
          case 'down':
            pointer.style.top = (parsePx(pointer.style.top) + pixelStep) + 'px';
            break;
          default:
        }
        break;
      default:
        console.log('Not valid type');
    }
  };

  function parsePx(value) {
    return parseInt(value.split('px')[0]);
  }

}());
