'use strict';

var url = ((window.location.protocol === "https:") ? "wss" : "ws") + "://" + window.location.host;
var ws = new WebSocket(url);

var container = document.getElementById('container');
var latencySpan = document.getElementById('latency');

/*// How many times a second something is called
var eventCounter = 0;
setInterval(function() {
console.info('called', eventCounter);
eventCounter = 0;
}, 1000);*/

//eventCounter++;

var clicking = false;
var gyroScrolling = false;
var latencyTimestamp;
var lastScrollPos;
var lastOrientationTimestamp;

var lastSentMs;
var lastPosition;
var sendInterval = 1000 / 60;
var sendBatchSize = 1;
var sendBuffer = [];
var sendEveryNth = 1;
var posCounter = 0;


ws.onopen = onopen;
ws.onmessage = onmessage;
ws.onclose = function(e) {
  setStatus('disconnected');
};


// Check if touch device
if ('ontouchstart' in window) {

  // If touchmove haven't been called before touchend, it is presumed as a click
  container.addEventListener("touchstart", touchstart);
  container.addEventListener("touchmove", touchmove);
  container.addEventListener("touchend", touchend);
} else {
  container.addEventListener("mousemove", sendPosition);
  container.addEventListener("click", function() {
    ws.send("click:left");
  });
}

function onopen() {
  console.log("WS connected");

  setStatus('no-client');

  ws.send('join:' + window.location.href.split('/')[3]);

  setInterval(function sendPing() {
    latencyTimestamp = Date.now();
    ws.send("ping:null");
  }, 2000);
}

function onmessage(msgEvent) {
  //console.log('RX:', msgEvent.data);

  var parts = msgEvent.data.split(':');
  var type = parts[0];
  var value = parts[1];

  switch (type) {
    case 'pong':
      var ms = Date.now() - latencyTimestamp;
      latencySpan.innerHTML = '-';

      console.info('latency - ' + ms);

      // Timeout is to see that the text gets updated
      setTimeout(function() {
        latencySpan.innerHTML = 'latency: ' + ms + 'ms';
      }, 100);
      break;

    case 'connected':
    case 'no-client':
      setStatus(type);
      break;
  }
}

function touchstart(e) {
  e.preventDefault();

  clicking = true;

  if (e.touches.length === 3 && window.DeviceOrientationEvent) {
    clicking = false;
    gyroScrolling = !gyroScrolling;

    if (!gyroScrolling) {
      setStatus('gyro-off');
      window.removeEventListener('deviceorientation', devOrientHandler);
    } else {
      setStatus('gyro-on');
      lastOrientationTimestamp = Date.now();
      window.addEventListener('deviceorientation', devOrientHandler);
    }
  }
}

function touchmove(e) {
  e.preventDefault(); // removes window scroll

  clicking = false;

  if (e.touches.length === 2) {
    return sendScrolling(e.touches[0]);
  }
  sendPosition(e.touches[0]);
}

function touchend(e) {
  e.preventDefault();
  lastScrollPos = null;

  if (clicking) {
    ws.send("click:left");
  }
}

function devOrientHandler(e) {

  if (lastOrientationTimestamp + sendInterval < Date.now()) {

    lastOrientationTimestamp += sendInterval;

    var beta = Math.round(e.beta) * sendInterval;

    ws.send("scroll:" + (beta * -0.0001).toString());
  }
}


function flushSendBuffer() {
  if (true || sendBuffer.length >= sendBatchSize) {
    ws.send("pos:" + sendBuffer.join(";"));
    sendBuffer.length = 0;
    return true;
  }
  return false;
}

function sendPosition(e) {
  if (posCounter++ % sendEveryNth)
    return;
  sendBuffer.push("" + e.clientX / window.innerWidth + "," + e.clientY / window.innerHeight);
  if (!lastSentMs || lastSentMs + sendInterval < Date.now()) {
    if (flushSendBuffer())
      lastSentMs = Date.now();
  } else {
    clearTimeout(lastPosition);
    lastPosition = setTimeout(flushSendBuffer, sendInterval);
  }
}

function sendScrolling(e) {

  if (!lastSentMs || lastSentMs + sendInterval < Date.now()) {
    lastSentMs = Date.now();
    sendScrollingHelper(e);
  } else {
    clearTimeout(lastPosition);
    lastPosition = setTimeout(function() {
      sendScrollingHelper(e);
    }, sendInterval);
  }
}

function sendScrollingHelper(e) {
  var newScrollPos = e.clientY / window.innerHeight;

  if (lastScrollPos && newScrollPos - lastScrollPos !== 0) {
    ws.send("scroll:" + (newScrollPos - lastScrollPos).toString());
  }

  lastScrollPos = newScrollPos;
}

function setLatency(value) {
  ws.send("setLatency:" + (value || 0));
}

function setHz(value) {
  var hz = parseFloat(value);
  if (!hz) {
    sendInterval = 0;
  } else {
    // Convert Hz to interval
    sendInterval = 1000 / hz;
  }
}

function setBatchSize(value) {
  sendBatchSize = value || 1;
  sendBuffer.length = 0;
}

function setNthEvent(value) {
  sendEveryNth = value || 1;
  sendBuffer.length = 0;
}


var statusMessages = {
  'disconnected': document.getElementById('disconnected'),
  'no-client': document.getElementById('no-client'),
  'gyro-unsupported': document.getElementById('gyro-unsupported'),
  'gyro-off': document.getElementById('gyro-off'),
  'gyro-on': document.getElementById('gyro-on')
};

function setStatus(value) {

  for (var i in statusMessages) {
    statusMessages[i].style.display = 'none';
  }

  switch (value) {
    case 'disconnected':
    case 'no-client':
    case 'gyro-off':
    case 'gyro-on':
      statusMessages[value].style.display = 'block';
      break;

    case 'connected':
      if (!window.DeviceOrientationEvent) {
        statusMessages['gyro-unsupported'].style.display = 'block';
        return;
      }
      if (gyroScrolling) {
        statusMessages['gyro-on'].style.display = 'block';
      } else {
        statusMessages['gyro-off'].style.display = 'block';
      }
      break;
  }

}

function showDebugBar(value) {
  document.getElementById('debug-bar').style.display = (value ? 'flex' : 'none');
}
