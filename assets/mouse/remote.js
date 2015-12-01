var url = ((window.location.protocol === "https:") ? "wss" : "ws") + "://" + window.location.host;
var ws = new WebSocket(url);

// Debug Bar
var debugContainer = document.createElement("div");
debugContainer.style.width = '100%';
debugContainer.style['background-color'] = '#DDD';
debugContainer.style['border-bottom'] = '1px solid black';
debugContainer.style.position = 'absolute';
debugContainer.style.top = '0px';
debugContainer.style.left = '0px';

// Latency Input
latencyInput = document.createElement("input");
latencyInput.type = 'number';
latencyInput.min = 0;
latencyInput.style.minWidth = '150px';
latencyInput.placeholder = latencyInput.title = 'Latency in ms';
debugContainer.appendChild(latencyInput);

// Latency Submit
latencySubmit = document.createElement("button");
latencySubmit.innerHTML = 'Submit';
latencySubmit.onclick = function() {
  ws.send("setLatency:" + (latencyInput.value || 0));
};
debugContainer.appendChild(latencySubmit);

debugContainer.appendChild(document.createTextNode("\u00A0"));

// Mouse position sending interval Input (0 = infinity)
mousePositionHzInput = document.createElement("input");
mousePositionHzInput.type = 'number';
mousePositionHzInput.min = 0;
mousePositionHzInput.max = 1000;
mousePositionHzInput.style.minWidth = '150px';
mousePositionHzInput.placeholder = mousePositionHzInput.title = 'Mouse position Hz';
debugContainer.appendChild(mousePositionHzInput);

// Mouse position sending interval Submit
mousePositionHzSubmit = document.createElement("button");
mousePositionHzSubmit.innerHTML = 'Set';
mousePositionHzSubmit.onclick = function() {
  var hz = parseFloat(mousePositionHzInput.value);
  if (!hz) {
    mousePositionInterval = 0;
  } else {
    // Convert Hz to interval
    mousePositionInterval = 1000 / hz;
  }
};
debugContainer.appendChild(mousePositionHzSubmit);

debugContainer.appendChild(document.createTextNode("\u00A0"));

// Batch size input
batchInput = document.createElement("input");
batchInput.type = 'number';
batchInput.min = 1;
batchInput.style.minWidth = '150px';
batchInput.placeholder = batchInput.title = 'Position batch size';
debugContainer.appendChild(batchInput);

// Batch size button
batchSubmit = document.createElement("button");
batchSubmit.innerHTML = 'Set';
batchSubmit.onclick = function() {
  sendBatchSize = batchInput.value || 1;
  sendBuffer.length = 0;
};
debugContainer.appendChild(batchSubmit);

debugContainer.appendChild(document.createTextNode("\u00A0"));

// Send nth input
nthInput = document.createElement("input");
nthInput.type = 'number';
nthInput.min = 1;
nthInput.style.minWidth = '150px';
nthInput.placeholder = nthInput.title = 'Send every Nth event';
debugContainer.appendChild(nthInput);

// Send nth button
nthSubmit = document.createElement("button");
nthSubmit.innerHTML = 'Set';
nthSubmit.onclick = function() {
  sendEveryNth = nthInput.value || 1;
  sendBuffer.length = 0;
};
debugContainer.appendChild(nthSubmit);

debugContainer.appendChild(document.createTextNode("\u00A0"));

// Client logging
loggingLabel = document.createElement("label");
loggingLabel.appendChild(document.createTextNode("Client logging"));
loggingBox = document.createElement("input");
loggingBox.type = "checkbox";
loggingBox.checked = true;
loggingBox.onchange = function() {
  ws.send("log:" + loggingBox.checked);
};
loggingLabel.appendChild(loggingBox);
debugContainer.appendChild(loggingLabel);

debugContainer.appendChild(document.createTextNode("\u00A0"));

// Latency Span
latencySpan = document.createElement("span");
debugContainer.appendChild(latencySpan);

document.body.appendChild(debugContainer);

var container = document.getElementById('container');
var statusElement = document.getElementById('status');

var latencyTimestamp;

ws.onopen = function() {
  console.log("WS connected");

  ws.send('join:' + window.location.href.split('/')[3]);
};

ws.onmessage = function(msgEvent) {
  console.log('RX:', msgEvent.data);

  var parts = msgEvent.data.split(':');
  var type = parts[0];
  var value = parts[1];

  switch (type) {
    case 'pong':
      var ms = Date.now() - latencyTimestamp;

      // Timeout is to see that the text gets updated
      latencySpan.innerHTML = '-';
      setTimeout(function() {
        latencySpan.innerHTML = 'latency: ' + ms + 'ms';
      }, 100);
      break;

    case 'connected':

      statusElement.innerHTML = 'Move mouse pointer and click around to send.';

      break;

    case 'disconnected':

      statusElement.innerHTML = 'No client connected.';

      break;
  }
};


// If touch device
if ('ontouchstart' in window) {

  // If touchmove haven't been called before touchend, it is presumed as a click
  // e.preventDefault(); removes window scroll

  var tapStart;
  container.addEventListener("touchstart", function(e) {
    e.preventDefault();
    tapStart = true;
  });
  container.addEventListener("touchend", function(e) {
    e.preventDefault();

    if (tapStart) {
      ws.send("click:left");
    }
  });

  container.addEventListener("touchmove", function(e) {
    e.preventDefault();
    tapStart = false;

    sendPosition(e.touches[0]);
  });
} else {
  container.addEventListener("click", function(e) {
    ws.send("click:left");
  });

  container.addEventListener("mousemove", sendPosition);
}

// Send ping to server to get ping
setInterval(function() {
  latencyTimestamp = Date.now();
  ws.send("ping:null");
}, 2000);

function step(direction) {
  ws.send("step:" + direction);
}

function mouseClick() {
  ws.send("click:left");
}

// send position at max specified times a second

var lastSentMs;
var lastPosition;
var mousePositionInterval = 0;
var sendBatchSize = 1;
var sendBuffer = [];
var sendEveryNth = 1;
var posCounter = 0;

function flushSendBuffer() {
  if (sendBuffer.length >= sendBatchSize) {
    ws.send("pos:" + sendBuffer.join(";"));
    sendBuffer.length = 0;
    return true;
  }
  return false;
}

function sendPosition(evt) {
  if (posCounter++ % sendEveryNth)
    return;
  sendBuffer.push("" + evt.clientX / window.innerWidth + "," + evt.clientY / window.innerHeight);
  if (!lastSentMs || lastSentMs + mousePositionInterval < Date.now()) {
    if (flushSendBuffer())
      lastSentMs = Date.now();
  } else {
    clearTimeout(lastPosition);
    lastPosition = setTimeout(flushSendBuffer, mousePositionInterval);
  }
}
