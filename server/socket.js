(function() {
  'use strict';

  var WebSocketServer = require('ws').Server;

  module.exports = function(server) {

    var wss = new WebSocketServer({
      server: server
    });

    var clients = {};
    var remotes = {};

    wss.on('connection', function(ws) {

      var latency = 0;

      ws.on('message', function(message) {

        setTimeout(function() {

          var parts = message.split(':');
          var action = parts[0];
          var value = parts[1];

          switch (action) {

            case 'create':
              // Get available roomcode, use provided one if free
              var roomcode = getRoomCode(value);

              clients[roomcode] = ws;
              ws.roomcode = roomcode;

              if (remotes[roomcode] && remotes[roomcode].length) {
                remotes[roomcode].forEach(function(remote) {
                  remote.sendToSocket('connected:');
                });
                ws.sendToSocket('connected:');
              }

              // Send roomcode to client
              ws.sendToSocket('roomcode:' + roomcode);

              // Remove from connections object when client disconnected
              ws.on('close', function() {

                setTimeout(function() {
                  delete clients[roomcode];

                  if (remotes[roomcode] && remotes[roomcode].length) {
                    remotes[roomcode].forEach(function(remote) {
                      remote.sendToSocket('no-client:');
                    });
                  }
                }, latency);
              });

              break;

            case 'join':

              if (!remotes[value]) {
                remotes[value] = [];
              }

              remotes[value].push(ws);
              ws.roomcode = value;

              if (clients[value]) {
                ws.sendToSocket('connected:');
                ws.sendToClient('connected:');
              }

              ws.on('close', function() {
                setTimeout(function() {
                  var index = remotes[value].indexOf(ws);
                  remotes[value].splice(index, 1);

                  if (!remotes[value].length) {
                    ws.sendToClient('disconnected:');
                  }
                }, latency);
              });

              break;

            case 'step':
            case 'click':
            case 'pos':
            case 'scroll':
              ws.sendToClient(message);
              break;
            case 'ping':
              ws.sendToSocket('pong');
              break;
            case 'setLatency':
              latency = Math.max(value, 0);
              break;
            default:
              console.error('Message type "' + action + '" not supported');
          }

        }, latency);

      });

      ws.sendToSocket = function(data) {
        ws.send(data, function(err) {
          if (err) {
            return console.error(err);
          }
        });
      };

      ws.sendToClient = function(data) {
        if (clients[ws.roomcode]) {
          clients[ws.roomcode].sendToSocket(data);
        } else {
          ws.sendToSocket('error:noClient');
        }
      };
    });


    function getRoomCode(value) {

      if (value && !clients[value]) {
        return value;
      }

      var possible = 'ABCDEFGHJKLMNPQRTUVWXYZ2346789';
      var roomcode = '';

      for (var i = 0; i < 5; i++) {
        roomcode += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      if (clients[roomcode]) {
        return getRoomCode();
      }

      return roomcode;
    }

  };

}());
