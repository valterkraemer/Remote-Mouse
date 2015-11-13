(function() {
  'use strict';

  // TODO:
  // If we already have a socket/session open, this will open a new one.
  // Is that a bug or a feature?

  var channel = (sessionStorage.getItem("remote-mouse-last-channel") || "test");
  channel = (prompt("Enter channel to join", channel) || "");

  var pointer = document.createElement('img');
  // Pointer tinkered from:
  // https://openclipart.org/detail/222076/white-mouse-cursor-arrow
  pointer.setAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAUCAMAAACzvE1FAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3woUByEHrcNK9gAAAH5QTFRF9vb2%2F%2F%2F%2F6urqAQEBEhISFhYWFxcXLS0tMjIyNDQ0ODg4Pj4%2BRUVFSUlJS0tLT09PWFhYXl5eX19fcnJydXV1jo6Oj4%2BPkpKSmJiYmZmZm5ubn5%2BfoqKiqampsrKywsLCw8PDxcXFzs7O0tLS2tra3Nzc5%2Bfn9%2Ff3%2Bfn5%2F%2F%2F%2FDUkwHwAAAAN0Uk5TAADMaKRKRQAAAAFiS0dEKcq3hSQAAAB0SURBVBjTZdBHEoMwEETRaRxIDmRrnMAkw%2F0vyAIxCPGXb9NVTbAiAC8bDsoC7662EAyGEIBgNGQGQzSssoCIwCIraBH4MD%2BOSuD3TxNmfpKG6vTubsZK5TfheG0Fzl6PqP5mAq4DlHHuCjgAcClIYPfYpgmojQvVxGP2NgAAAABJRU5ErkJggg%3D%3D');
  pointer.style.position = 'absolute';
  pointer.style.height = '20px';
  pointer.style.width = '16px';
  pointer.style['z-index'] = 100000;

  var lastPos = sessionStorage.getItem("remote-mouse-last-position:" + channel);
  if (lastPos) {
    lastPos = lastPos.split(":");
    pointer.style.left = lastPos[0];
    pointer.style.top = lastPos[1];
  } else {
    pointer.style.left = '100px';
    pointer.style.top = '100px';
  }

  window.addEventListener("unload", function() {
    sessionStorage.setItem("remote-mouse-last-position:" + channel, pointer.style.left + ":" + pointer.style.top);
  });

  var pixelStep = 10;
  var log = true;

  var url = ((window.location.protocol === "https:") ? "wss:" : "ws:") + window.__remoteMouseBaseUrl;
  var ws = new WebSocket(url);

  ws.onopen = function() {
    if (log) console.log("WS connected");
    ws.send("register:" + channel);
    sessionStorage.setItem("remote-mouse-last-channel", channel);
    document.body.appendChild(pointer);
  };

  ws.onmessage = function(msgEvent) {
    var message = msgEvent.data;
    if (log) console.log('RX: ', message);

    var parts = message.split(':');

    if (parts.length !== 2) {
      if (log) console.log('Not valid message');
      return;
    }

    var type = parts[0];
    var value = parts[1];


    switch (type) {
      case 'click':
        if (log) console.log('click');
        document.elementFromPoint(pointerLeft() - 1, pointerTop() - 1).click();
        break;
      case 'step':
        switch (value) {
          case 'left':
            pointer.style.left = (pointerLeft() - pixelStep) + 'px';
            break;
          case 'up':
            pointer.style.top = (pointerTop() - pixelStep) + 'px';
            break;
          case 'right':
            pointer.style.left = (pointerLeft() + pixelStep) + 'px';
            break;
          case 'down':
            pointer.style.top = (pointerTop() + pixelStep) + 'px';
            break;
          default:
        }
        break;
      case 'pos':
        var lt = parsePos(value);
        pointer.style.left = (lt[0]*100) + '%';
        pointer.style.top = (lt[1]*100) + '%';
        break;
      case 'log':
        log = (value === 'true');
        break;
      default:
        if(log) console.log('Not valid type');
    }
  };

  function parsePx(value, ref) {
    if (value.indexOf('%') != -1)
      return parseInt(parseFloat(value.split('%')[0])/100 * ref);
    return parseInt(value.split('px')[0]);
  }

  function pointerLeft() {
    return parsePx(pointer.style.left, window.innerWidth);
  }

  function pointerTop() {
    return parsePx(pointer.style.top, window.innerHeight);
  }

  function parsePos(value) {
    var lt = value.split(',');
    return [parseFloat(lt[0]), parseFloat(lt[1])];
  }
}());
