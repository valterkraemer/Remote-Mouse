(function() {
  'use strict';

  if (window.remoteMouseRun) {
    console.log('already loaded');
    return;
  }
  window.remoteMouseRun = true;

  // CONNECTION-MODAL
  var connectionModal = document.createElement('div');

  connectionModal.style.cssText = [
    'top: 50%',
    'left: 50%',
    'position: fixed',
    'background-color: #FFF',
    'transform: translate(-50%, -50%)',
    'z-index: 10001',
    'width: 450px',
    'border: 1px',
    'box-shadow: 0 3px 9px rgba(0, 0, 0, .5)',
    'border-radius: 5px',
    'padding: 30px 15px',
    'font-family: Arial, Helvetica, sans-serif',
    'font-size: 16px',
    'text-align: center',
    'color: #333'
  ].join(';');

  var goToText = document.createElement('div');
  goToText.innerHTML = 'Go to';
  connectionModal.appendChild(goToText);

  var qrCode = document.createElement('img');
  connectionModal.appendChild(qrCode);

  var urlText = document.createElement('div');
  urlText.style.cssText = [
    'font-size: 20px',
    'padding: 10px 0'
  ].join(';');
  connectionModal.appendChild(urlText);

  var row3Text = document.createElement('div');
  row3Text.innerHTML = 'on your remote device to control this window';
  connectionModal.appendChild(row3Text);

  var cancel = document.createElement("button");
  cancel.innerHTML = 'Cancel';
  cancel.onclick = function() {
    window.remoteMouseRun = false;
    connectionModal.style.display = 'none';
    pointer.style.display = 'none';
  };
  cancel.style.cssText = [
    'margin-top: 15px',
    'border-radius: 8px',
    'font-size: 18px',
    'padding: 10px 20px',
    'color: #FFF',
    'background-color: #f0ad4e',
    'border: 1px solid transparent',
    'cursor: pointer'
  ].join(';');

  connectionModal.appendChild(cancel);

  document.body.appendChild(connectionModal);


  // POINTER
  var pointer = document.createElement('img');

  // https://openclipart.org/detail/222076/white-mouse-cursor-arrow
  pointer.setAttribute('src', [
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAUCAMAAACzvE1FAAAACXBIWXMAAAsTAAAL',
    'EwEAmpwYAAAAB3RJTUUH3woUByEHrcNK9gAAAH5QTFRF9vb2%2F%2F%2F%2F6urqAQEBEhISFhYWFxcXLS0tMj',
    'IyNDQ0ODg4Pj4%2BRUVFSUlJS0tLT09PWFhYXl5eX19fcnJydXV1jo6Oj4%2BPkpKSmJiYmZmZm5ubn5%2Bfoq',
    'KiqampsrKywsLCw8PDxcXFzs7O0tLS2tra3Nzc5%2Bfn9%2Ff3%2Bfn5%2F%2F%2F%2FDUkwHwAAAAN0Uk5TAA',
    'DMaKRKRQAAAAFiS0dEKcq3hSQAAAB0SURBVBjTZdBHEoMwEETRaRxIDmRrnMAkw%2F0vyAIxCPGXb9NVTbAiAC',
    '8bDsoC7662EAyGEIBgNGQGQzSssoCIwCIraBH4MD%2BOSuD3TxNmfpKG6vTubsZK5TfheG0Fzl6PqP5mAq4DlH',
    'HuCjgAcClIYPfYpgmojQvVxGP2NgAAAABJRU5ErkJggg%3D%3D'
  ].join(''));

  pointer.style.cssText = [
    'position: fixed',
    'height: 40px', // 20px
    'width: 32px', // 16px
    'z-index: 100000',
    'display: none'
  ].join(';');

  document.body.appendChild(pointer);

  var roomcode;

  var baseUrl = window.__remoteMouseBaseUrl;
  var url = ((window.location.protocol === "https:") ? "wss:" : "ws:") + baseUrl;
  var ws = new WebSocket(url);


  ws.onopen = function() {
    var session = sessionStorage.getItem('remote-mouse-roomcode') || '';
    ws.send('create:' + session);
  };

  ws.onmessage = function(msgEvent) {
    var message = msgEvent.data;

    var parts = message.split(':');

    if (parts.length !== 2) {
      return;
    }

    var type = parts[0];
    var value = parts[1];

    switch (type) {
      case 'click':
        click();
        break;
      case 'pos':
        processPos(value);
        break;
      case 'scroll':
        document.body.scrollTop = document.body.scrollTop + window.innerHeight * value;
        break;
      case 'roomcode':
        roomcode = value;
        sessionStorage.setItem('remote-mouse-roomcode', value);
        var protocol = (baseUrl === '//localhost:3000' ? 'http:' : 'https:');
        var roomUrl = protocol + baseUrl + '/' + roomcode;
        urlText.innerHTML = roomUrl;
        qrCode.setAttribute('src', 'https://api.qrserver.com/v1/create-qr-code/?color=000000&bgcolor=FFFFFF&qzone=1&margin=10&size=120x120&ecc=L&data=' + encodeURIComponent(roomUrl));
        break;
      case 'connected':
        pointer.style.display = 'block';
        connectionModal.style.display = 'none';
        break;
      case 'disconnected':
        connectionModal.style.display = 'block';
        pointer.style.display = 'none';
        break;
      default:
        console.log('Not valid message', message);
    }
  };

  function click() {
    var left = window.innerWidth * parseFloat(pointer.style.left.slice(0, -1) / 100);
    var top = window.innerHeight * parseFloat(pointer.style.top.slice(0, -1) / 100);

    document.elementFromPoint(parseInt(left - 1, 10), parseInt(top - 1, 10)).click();
  }

  function processPos(value) {
    var lts = value.split(';');
    for (var i in lts) {
      var lt = lts[i].split(',');
      pointer.style.left = parseFloat(lt[0]) * 100 + '%';
      pointer.style.top = parseFloat(lt[1]) * 100 + '%';
    }
  }

}());
