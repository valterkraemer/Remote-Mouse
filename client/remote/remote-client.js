var url = ((window.location.protocol === "https:") ? "wss" : "ws") + "://" + window.location.host;
var ws = new WebSocket(url);

ws.onopen = function() {
  console.log("WS connected");
};

ws.onmessage = function(msgEvent) {
  console.log("RX: %s", msgEvent.data);
};

function join(mouseMode) {
  document.getElementById('join-form').style.display = 'none';
  document.getElementById('navigation').style.display = 'block';
  if (mouseMode) {
    document.addEventListener("mousemove", sendPosition);
    document.addEventListener("touchmove", sendTouchPosition);
    document.addEventListener("click", mouseClick);
  } else {
    document.addEventListener(
      "touchmove", function(evt) { evt.preventDefault(); });
  }
  ws.send('join:' + document.getElementById('channel').value);
}

function step(direction) {
  ws.send("step:" + direction);
}

function mouseClick() {
  ws.send("click:left");
}

function sendPosition(evt) {
  ws.send("pos:" + evt.clientX/window.innerWidth + "," + evt.clientY/window.innerHeight);
}

function sendTouchPosition(evt) {
  evt.preventDefault();

  sendPosition(evt.touches[0]);
}

document.addEventListener('DOMContentLoaded', function() {
  FastClick.attach(document.body);
}, false);
