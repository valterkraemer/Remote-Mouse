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

wss.broadcast = function(data, sender) {
  for (var client of this.clients) {
    if (client != sender)
      client.send(data);
  }
};

wss.on("connection", function(ws) {
  console.log("New connection!");
  ws.on("message", function(msg) {
    console.log("RX: %s", msg);
    wss.broadcast(msg, ws);
  });
});

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
