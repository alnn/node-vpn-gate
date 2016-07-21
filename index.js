#!/usr/bin/env node
"use strict";

var express = require('express'),
    app     = express(),
    vpnProvider = require('./lib/vpnProvider'),
    appConf = require('./configs/config'),
    path    = require('path'),
    server= require('http').createServer(app),
    initSockApi = require('./lib/socketApi'),
    country = process.argv[2],
    vpnGate;

app.set('port', appConf.port);
app.use(express.static(path.join(__dirname, '/client/public')));

vpnGate = vpnProvider(country);
vpnGate.loadCsv();

server.listen(appConf.port, function() {
    initSockApi(server, vpnGate);
});

app.get('/', function(req, res, next) {
    res.sendFile('index.html');
});

vpnGate.on("csv-loaded", function(configs, config) {
    vpnGate.connect();
});

vpnGate.on("vpn-failed", function() {
    vpnGate.tryNext();
});
