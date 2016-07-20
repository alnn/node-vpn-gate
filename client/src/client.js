import "./scss/Layout.scss";

import io from "socket.io-client";

import React from "react";
import ReactDom from "react-dom";

import Dashboard from "./components/Dashboard.react.js";

const app = document.getElementById('app');

ReactDom.render(<Dashboard url="http://localhost:9000" />, app);

//return;
/*
(function() {

    var socket = io('http://localhost:9000', { // ???
            transports: ['websocket']
        }),
        configRows;

    socket.on('soc-connected', function(message) {
        console.log('connected!d');
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
            //window.lib.connectVpn(tr.getAttribute('vpn-id'));
            window.app.connectVpn(1);
        }
    });

}());
*/