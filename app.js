(function() {
  'use strict';

  var server = require('http').createServer();
  var url = require('url');

  var express = require('express');
  var app = express();
  var port = process.env.PORT || 3000;

  if (process.env.NODE_ENV === 'production') {
    console.log('force HTTPS');

    app.use(function(req, res, next) {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        res.redirect(['https://', req.get('Host'), req.url].join(''));
      } else {
        next();
      }
    });
  }

  app.use('/assets', express.static('assets'));

  app.get('/', function(req, res) {
    res.sendFile('views/index.html', {
      root: './'
    });
  });

  app.get('/:id', function(req, res) {
    res.sendFile('views/mouse.html', {
      root: './'
    });
  });

  require('./server/socket')(server);

  server.on('request', app);
  server.listen(port, function() {
    console.log('Listening on ' + server.address().port);
  });

}());
