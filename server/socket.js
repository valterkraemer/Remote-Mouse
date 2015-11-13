(function() {
  'use strict';

  module.exports = function(wss) {

    var channels = {};

    wss.broadcast = function(data, sender) {
      if (!channels[sender.channel]) {
        return console.log('No host in channel');
      }
      channels[sender.channel].send(data, function(err) {
        if (err) {
          return console.error('No host connected');
        }
      });
    };

    wss.on('connection', function connection(ws) {
      console.log("New connection");

      var latency = 0;

      ws.on('message', function incoming(message) {

        setTimeout(function() {

          console.log('message:', message);

          var parts = message.split(':');

          if (parts.length !== 2) {
            return console.log('Not valid message');
          }

          var type = parts[0];
          var value = parts[1];

          if (!value) {
            return console.error('Value not defined');
          }

          switch (type) {
            case 'register':
              channels[value] = ws;
              break;
            case 'join':
              ws.channel = value;
              break;
            case 'step':
            case 'click':
            case 'pos':
              wss.broadcast(message, ws);
              break;
            case 'ping':
              ws.send('pong', function(err) {
                if (err) console.error('err', err);
              });
              break;
            case 'setLatency':
              latency = Math.max(value, 0);
              break;
            default:
              console.error('Message type "' + type + '" not supported');
          }

        }, latency);

      });

    });
  };

}());
