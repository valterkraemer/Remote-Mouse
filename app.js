(function() {
  'use strict';

  var server = require('http').createServer();
  var url = require('url');

  var express = require('express');
  var app = express();
  var port = process.env.PORT || 3000;

  app.use('/', express.static('public'));
  app.use('/:id', express.static('public/mouse'));
  app.use('/step/', express.static('public/step'));

  require('./server/socket')(server);

  server.on('request', app);
  server.listen(port, function() {
    console.log('Listening on ' + server.address().port);
  });

}());
