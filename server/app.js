/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = require('./config/environment');
// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);

var WebSocketServer = require("ws").Server;
var wss = new WebSocketServer({ server: server });

var channelPositions = {};

wss.broadcast = function(data, sender) {
  console.log("TX(%s): %s", sender.remoteMouseChannel, data);
  for (var client of this.clients) {
    if (client != sender && client.remoteMouseChannel === sender.remoteMouseChannel)
      client.send(data);
  }
};

wss.on("connection", function(ws) {
  console.log("New connection!");
  ws.remoteMouseChannel = "";
  ws.on("message", function(msg) {
    console.log("RX(%s): %s", ws.remoteMouseChannel, msg);
    if (msg.indexOf("join:") === 0) {
      ws.remoteMouseChannel = msg.substring("join:".length);
      // Send last known position on join
      var pos = channelPositions[ws.remoteMouseChannel];
      if (pos)
        ws.send(pos);
    }
    else {
      if (msg.indexOf("pos:") === 0)
        channelPositions[ws.remoteMouseChannel] = msg;
      wss.broadcast(msg, ws);
    }
  });
});

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
