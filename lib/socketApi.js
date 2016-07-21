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
            var config = vpnGate.getActiveConfig();
            if (config) {
                io.emit('status',config.export());
            }
        }, 500);

    });

    vpnGate.on("vpn-log", function(data) {
        io.emit('log', data);
    });

    io.on('connection', function(socket) {

        socket.emit('soc-connected');

        socket.on('require-configs', function() {
            socket.emit('configs', {
                configs: vpnGate.getConfigs(true),
                countries: vpnGate.getConfigs().getCountries()
            });
        });

        socket.on('connect-vpn', function(id) {
            vpnGate.connect(id);
        });

        socket.on('disconnect-vpn', function() {
            vpnGate.disconnect();
        });

        socket.on('csv-reload', function() {
            vpnGate.loadCsv(true);
        });

    });

};
