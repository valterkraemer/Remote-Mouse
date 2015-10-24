var ws;
if (window.location.protocol === "https:") {
  ws = new WebSocket("wss://remote-mouse.herokuapp.com");
} else {
  ws = new WebSocket("ws://localhost:3000");
}

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

document.addEventListener('DOMContentLoaded', function() {
  FastClick.attach(document.body);
}, false);
