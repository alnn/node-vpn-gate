"use strict";

var io      = require('socket.io'),
    statusRefreshID;

module.exports = function (server, vpnGate) {

    io = io.listen(server, {transports: ['websocket']});

    vpnGate.on("csv-loaded", function(configs, config) {

        io.emit('csv-loaded');

        if (statusRefreshID) {
            clearInterval(statusRefreshID);
        }

        statusRefreshID = setInterval(function() {
            io.emit('status', vpnGate.getActiveConfig().export());
        }, 1000);

    });

    vpnGate.on("vpn-log", function(data) {
        io.emit('log', data);
    });

    io.on('connection', function(socket) {

        socket.emit('soc-connected');

        socket.on('require-configs', function() {
            socket.emit('configs', vpnGate.getConfigs(true));
        });

        socket.on('connect-vpn', function(id) {
            vpnGate.connect(id);
        });

        socket.on('disconnect-vpn', function() {
            vpnGate.disconnect();
        });

        socket.on('csv-reload', function() {
            vpnGate.loadCsv();
        });

    });

};
