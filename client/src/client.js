import "./scss/Layout.scss";

import ioClient from "socket.io-client";

import React from "react";
import ReactDom from "react-dom";

import Dashboard from "./Dashboard.react";

const app = document.getElementById('app');

ReactDom.render(<Dashboard />, app);

(function() {

    var socket = ioClient('localhost:9000', { // ???
            transports: ['websocket']
        }),
        configRows;

    socket.on('soc-connected', function(message) {
        console.log('connected!');
    });

    socket.on('configs', function(configs) {
        console.log(configs);
    });

    socket.on('csv-loaded', function() {
        socket.emit('require-configs');
    });

    socket.on('log', function(message) {
        console.log(message);
    });

    socket.on('status', function(message) {
        console.log(message);
    });

    socket.on('booo', function(message) {
        console.log(message);
    });

    window.app = {

        configs: function() {
            socket.emit('require-configs');
        },

        connectVpn: function(id) {
            //console.log('connect vpn');
            socket.emit('connect-vpn', id);

        },

        disconnectVpn: function() {
            socket.emit('disconnect-vpn');
        },

        reloadCsv: function() {
            socket.emit('csv-reload');
        }

    };

    Array.prototype.forEach.call(document.getElementsByClassName('config-row'), function(elem) {
        elem.onclick = function(e) {
            var tr = e.target.parentNode;
            //window.app.connectVpn(tr.getAttribute('vpn-id'));
            window.app.connectVpn(1);
        }
    });

}());
