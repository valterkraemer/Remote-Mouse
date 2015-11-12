(function() {
  'use strict';

  var server = require('http').createServer();
  var url = require('url');
  var WebSocketServer = require('ws').Server;
  var wss = new WebSocketServer({
    server: server
  });
  var express = require('express');
  var app = express();
  var port = process.env.PORT || 3000;

  app.use(express.static('client'));
  require('./server/socket')(wss);

  server.on('request', app);
  server.listen(port, function() {
    console.log('Listening on ' + server.address().port);
  });

}());
