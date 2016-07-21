"use strict";
var spawn        = require('child_process').spawn,
    EventEmitter = require('events').EventEmitter,
    csvLoader    = require('./csvLoader'),
    confHolder   = require('./vpnConfigHolder'),
    cli          = require('./cli'),
    vpnProcess;

function exitHandler(err) {
    if (err) {
        cli.render('Error: ' + err.stack);
    }
    if (vpnProcess) {
        vpnProcess.kill();
    }
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('uncaughtException', exitHandler);

module.exports = function(country) {

    var self =  new EventEmitter(),
        configs,
        countries,
        countryID,
        config,
        useTryNext  = true,
        onCsvLoad   = function(csv) {
            return csvLoader.getSearch([], {commentChar: '*'})();
        },
        fails = [
            "Connection timed out",
            "Connection reset, restarting",
            "TLS handshake failed",
            "No route to host",
            //"Interrupted system call", // process.kill()
            //"received, process exiting" // process.kill()
        ];

    self.initConfigs = function(csvLines) {
        var cntID;

        if (undefined === configs) {
            configs = confHolder(csvLines);
        } else {
            configs.setUp(csvLines);
        }

        countries = configs.getCountries();

        for (cntID in countries) {
            if (country && (cntID.toLowerCase() === country.toLowerCase() ||
                countries[cntID].toLowerCase() === country.toLowerCase())) {
                countryID = cntID;
            }
        }

        if (country && !countryID) {
            throw new Error('Can\'t find config for country '+country);
        }

        if (country) {
            config = configs.getByCountryID(countryID)[0];
        } else {
            // They sorted by score by default, so let's get the best one
            config = configs.getAll()[0];
        }

    };

    self.getActiveConfig = function() {
        return config;
    };

    self.getConfigs = function(humanReadable) {
        if (humanReadable) {
            return configs.getAll().map(function (item) {
                return item.export();
            });
        }
        return configs;
    };

    self.connect = function(id) {

        if (id) {
            config = configs.getById(+id);
            if (!config) {
                cli.render("Error: config with id " + id + " not found");
                return;
            }
        }

        cli.render(config);

        self.disconnect();

        config.mount().then(function(confFileName) {

            vpnProcess = spawn('openvpn', [confFileName]);

            vpnProcess.stdout.on('data', function (data) {

                data = data.toString();

                self.emit('vpn-log', data);

                config.setStatus("Connecting");

                if (data.match('Initialization Sequence Completed')) {

                    config.setStatus("Connected");

                    self.emit('vpn-connected', data);

                } else if (data.match('Operation not permitted')) {
                    throw new Error('Operation not permitted');
                }

                fails.forEach(function(fail) {

                })
                for (var i = 0; i < fails.length; i++) {
                    if (data.match(fails[i])) {
                        self.emit('vpn-failed');
                        return;
                    }
                }

                cli.render(config);
            });

            vpnProcess.on('error', function(error) {

                self.emit("vpnprocess-error", error);

                if (error.code === 'ENOENT') {
                    cli.render('Please install openvpn at first! https://openvpn.net');
                    process.exit();
                } else {
                    throw error;
                }
            });

            vpnProcess.on('close', function(code) {

                self.emit("vpnprocess-exit", code);

                if (config) {
                    config.setStatus('Disconnected');
                    cli.render(config);
                }
            });

        });

    };

    self.disconnect = function() {
        if (vpnProcess) {
            vpnProcess.kill();
        }
    };

    self.tryNext = function(force) {
        if (!useTryNext && !force) {
            return;
        }
        config = configs.getNextById(config.getId());
        self.connect();
    };

    self.loadCsv = function(loadAnyway) {

        cli.render('Loading configs...');

        return csvLoader.load(onCsvLoad, loadAnyway).then(function(csvLines) {

            var errors = csvLoader.getErrors();
            if (errors.length > 0) {
                cli.render(errors.join('\n'));
                return;
            }

            self.initConfigs(csvLines);

            cli.render(config);

            self.emit('csv-loaded', configs, config);

        });
    };

    self.setTryNext = function(value) {
        useTryNext = value;
    };

    self.canTryNext = function() {
        return useTryNext;
    };

    cli.setControls(self);

    return self;
};
