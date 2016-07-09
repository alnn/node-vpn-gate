#!/usr/bin/env node
"use strict";

var DEBUG   = false,
    app     = require('express')(),
    vpngate = require('./vpn-provider');

DEBUG && console.log(process.argv);

vpngate.init(process.argv[2]).then(function(openVpnProc) {

    process.stdin.resume();

    function exitHandler(err) {
        if (err) {
            console.log(err.stack);
        }

        openVpnProc.kill();

        process.exit();
    }

    process.on('exit', exitHandler);
    process.on('SIGINT', exitHandler);
    process.on('uncaughtException', exitHandler);

});

vpngate.on("connected", function(data) {

    //console.info('\n\t\t\tVPN connection established!\n');

    //console.log("********* CONNECTED **********");
    //console.log(data);
    //console.log("******************************");

});


vpngate.on("trynext", function() {

});

app.set('port', 9000);


app.listen(app.get('port'), function() {
  //console.log('Node app is running on port', app.get('port'));
});

app.get('/', function (req, res) {
    res.send('booo!');
});
