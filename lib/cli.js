"use strict";

var meow        = require('meow'),
    logUpdate   = require('log-update'),
    keypress    = require('keypress'),
    appConfig   = require('./../configs/config'),
    cli;

cli = meow({
    help: [
        'Usage',
        '  $ sudo vpn-gate [COUNTRY]',
    ]
});

keypress(process.stdin);

cli.render = function(message) {

    var output;

    if ('object' === typeof message && message.id) {
        message = message.export();
        output = [
            '',
            //'                id: ' + message.id,
            '           Country: ' + message.countryName,
            '                IP: ' + message.ip,
            '   Line Throughput: ' + message.speed,
            '         Line Ping: ' + message.ping,
            '          Operator: ' + message.operator,
            '            Status: ' + message.status,
            '',
            'The following commands are available:',
            '   c = connect     n = next config',
            '   d = disconnect  q = quit',
            '',
            '(for more details go to ' + appConfig.host + ':' + appConfig.port + ')',
        ];
    } else {
        output = [
            '',
            '    ' + message,
            ''
        ];
    }

    logUpdate(output.join('\n'));

};

cli.setControls = function(vpnGate) {

    process.stdin.setRawMode && process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('keypress', function (chunk, key) {
        if (!key) {
            return;
        }
        switch (key.name) {
            case 'c':
                vpnGate.connect();
                break;
            case 'n':
                vpnGate.tryNext(true);
                break;
            case 'd':
                vpnGate.disconnect();
                break;
            case 'q':
                process.stdin.pause();
                vpnGate.disconnect();
                process.exit(0);
                break;
            default:
                // what else is there...
                break;
        }
    });

};

module.exports = cli;
