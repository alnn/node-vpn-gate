#!/usr/bin/env node
"use strict";

var express = require('express'),
    app     = express(),
    vpnProvider = require('./app/vpnProvider'),
    appConf = require('./app/config'),
    path    = require('path'),
    server= require('http').createServer(app),
    initSockApi = require('./app/socketApi'),
    country = process.argv[2],
    vpnGate;

app.set('port', appConf.port);
app.use(express.static(path.join(__dirname, '/client/public')));
app.get('/', function(req, res, next) {
    res.sendFile('index.html');
});

vpnGate = vpnProvider(country);
vpnGate.loadCsv();

server.listen(appConf.port, function() {
    initSockApi(server, vpnGate);
});

vpnGate.on("csv-loaded", function(configs, config) {
    //vpnGate.connect();
});

vpnGate.on("vpn-failed", function() {
    vpnGate.tryNext();
});

//vpnGate.on("vpn-connected", function() {
//
//});
