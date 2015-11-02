var url = ((window.location.protocol === "https:") ? "wss" : "ws") + "://" + window.location.host;
var ws = new WebSocket(url);

ws.onopen = function() {
  console.log("WS connected");
};

ws.onmessage = function(msgEvent) {
  console.log("RX: %s", msgEvent.data);
};

function join() {
  document.getElementById('join-form').style.display = 'none';
  document.getElementById('navigation').style.display = 'block';
  ws.send('join:' + document.getElementById('channel').value);
}

function step(direction) {
  ws.send("step:" + direction);
}

function mouseClick() {
  ws.send("click:left");
}

document.ontouchmove = function(event) {
  event.preventDefault();
};

function enableMouseMove() {
  document.addEventListener("mousemove", sendPosition);
  document.addEventListener("click", mouseClick);
};

function sendPosition(evt) {
  ws.send("pos:" + evt.clientX/window.innerWidth + "," + evt.clientY/window.innerHeight);
}

document.addEventListener('DOMContentLoaded', function() {
  FastClick.attach(document.body);
}, false);
