#!/usr/bin/env node
'use strict';

var express = require('express'),
  app = express(),
  vpnProvider = require('./lib/vpnProvider'),
  appConf = require('./configs/config'),
  path = require('path'),
  server = require('http').createServer(app),
  initSockApi = require('./lib/socketApi'),
  cli = require('./lib/cli'),
  cmdExists = require('./lib/cmdExists'),
  country = cli.input[0],
  vpnGate;

var port = cli.flags.p || cli.flags.port || appConf.port;

if (isNaN(parseInt(port))) {
  cli.render('Option -p must be a number');
  return;
}

app.set('port', port);

app.use(function(req, res, next) {
  res.cookie('port', port);
  res.cookie('host', appConf.host);
  next();
});

app.use(express.static(path.join(__dirname, '/client/public')));

var openvpnCmd = 'openvpn';

if (!cmdExists(openvpnCmd)) {
  openvpnCmd += 2;
}

vpnGate = vpnProvider(country, openvpnCmd);
vpnGate.loadCsv();

server.once("error", function(err) {
  if (err.code === "EADDRINUSE") {
    cli.render('Port ' + port + ' is currently in use');
  } else {
    cli.render('Error: ' + err.message);
  }
  cli.quit(vpnGate);
});

server.listen(port, function() {
  initSockApi(server, vpnGate);
});

vpnGate.on("csv-loaded", function(configs, config) {
  vpnGate.connect();
});

vpnGate.on("vpn-failed", function() {
  vpnGate.tryNext();
});
