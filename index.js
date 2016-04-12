#!/usr/bin/env node
"use strict";

var Promise, request, tmp, fs, spawn, vpngate, path, DEBUG;

DEBUG = false;

Promise = require("bluebird");
request = Promise.promisify(require('request'));
tmp     = Promise.promisifyAll(require('tmp'));
fs      = Promise.promisifyAll(require('fs'));
spawn   = require('child_process').spawn;
path    = require('path');

function VpnGate() {

    this._csvUrl     = 'http://www.vpngate.net/api/iphone/';
    this._csvFile    = 'vpn-gate.csv';
    this._csvFileLifeTime    = 3600 * 1000; // 1 hour
    this._openVpnConfigFile  = null;
    this._openvpnProc        = null;

    this._compileCsvFinder = function(csvString, searchField, options) {

        var outputData = csvString.trim("\n").split("\n").map(function(line) {
            if (options && options.commentChar && line.substr(0, options.commentChar.length) === options.commentChar) {
                return;
            }
            return line.split(",");
        }).filter(function(line) {
            return line != undefined;
        });

        var cols = outputData[0].reduce(function(item, val, index) {
            item[val.trim('\r')] = (index + '').trim('\r');
            return item;
        }, {});

        DEBUG && console.log(searchField);

        searchField = "string" === typeof searchField ? [searchField]: searchField;

        return function(column) {
            var result = [],
                rowSuitable = function(rowData) {

                    DEBUG && console.log(searchField);

                    for (var i in searchField) {
                        if (rowData[cols[searchField[i]]].toLowerCase() === column.toLowerCase()) {
                            return true;
                        }
                    }
                    return false;
                };
            for (var i = 1; i < outputData.length; i++) {
                if (undefined === column || rowSuitable(outputData[i])) {
                    result.push(
                        outputData[i].reduce(function(item, val, index) {
                            item[Object.keys(cols)[index]] = val;
                            return item;
                        }, {})
                    );
                }
            }
            return result;
        }

    };

    this._prepareOpenVpnConfig = function(configString) {
        this._openVpnConfigFile = tmp.fileSync().name;
        fs.writeFileSync(this._openVpnConfigFile, (new Buffer(configString, 'base64')).toString(), 'utf8');
        return this._openVpnConfigFile;
    };

    this._getAppDir = function() {
        var plat, homeDir, appDir;
        plat    = process.platform;
        homeDir = process.env[(plat == 'win32') ? 'USERPROFILE' : 'HOME'];

        if (plat == 'win32') {
            appDir = path.join(homeDir, 'AppData', 'vpn-gate');
        } else {
            appDir = path.join(homeDir, '.vpn-gate');
        }

        if (!fs.existsSync(appDir)) {
            fs.mkdirSync(appDir);
        }

        return appDir;
    };

}

VpnGate.compileCsvFinder = function(csvString, searchField, options) {

    var outputData = csvString.trim("\n").split("\n").map(function(line) {
        if (options && options.commentChar && line.substr(0, options.commentChar.length) === options.commentChar) {
            return;
        }
        return line.split(",");
    }).filter(function(line) {
        return line != undefined;
    });

    var cols = outputData[0].reduce(function(item, val, index) {
        item[val.trim('\r')] = (index + '').trim('\r');
        return item;
    }, {});

    DEBUG && console.log(searchField);

    searchField = "string" === typeof searchField ? [searchField]: searchField;

    return function(column) {
        var result = [],
            rowSuitable = function(rowData) {

                DEBUG && console.log(searchField);

                for (var i in searchField) {
                    if (rowData[cols[searchField[i]]].toLowerCase() === column.toLowerCase()) {
                        return true;
                    }
                }
                return false;
            };
        for (var i = 1; i < outputData.length; i++) {
            if (undefined === column || rowSuitable(outputData[i])) {
                result.push(
                    outputData[i].reduce(function(item, val, index) {
                        item[Object.keys(cols)[index]] = val;
                        return item;
                    }, {})
                );
            }
        }
        return result;
    }

};

VpnGate.prototype.pullCsv = function(url) {

    return request(url || this._csvUrl).then(function(result) {

        DEBUG && console.log(result);

        if (result.error || result.statusCode !== 200) {
            return '';
        }

        return result.body;
    });

};

VpnGate.prototype.isConfigDataExpired = function() {
    var fileStat;

    try {
        fileStat = fs.statSync(this._csvFile);
    } catch (error) {
        if (error.code == 'ENOENT') {
            throw error;
        }
    } finally {

        DEBUG && console.log(fileStat);

        return !fileStat || (new Date()).getTime() - fileStat.ctime.getTime() >= this._csvFileLifeTime;
    }

};

VpnGate.prototype.connect = function(countryName) {
    var csvLoadPromise, _this = this, appDir;

    appDir = this._getAppDir();
    try {
        process.chdir(appDir);
    } catch (err) {
        console.log('Application directory unreachable: ' + err);
    }

    if (this.isConfigDataExpired()) {
        DEBUG && console.log('file expired!!!');
        csvLoadPromise = this.pullCsv().then(function(csvString) {
            fs.writeFileSync(_this._csvFile, csvString, 'utf8');
            return csvString;
        });
    } else {
        csvLoadPromise =  new Promise(function(resolve, reject) {
            resolve(fs.readFileSync(_this._csvFile, 'utf8'));
            //reject(e);
        });
    }

    return csvLoadPromise.then(function(csvString) {
        var csvFinder = _this._compileCsvFinder(csvString, ["CountryShort", "CountryLong"], {commentChar: '*'})
        var configs   = csvFinder(countryName);

        if (configs.length === 0) {
            throw new Error("Can't find config for country '" + countryName + "'");
        }

        console.info(
            'Configuration data below will be loaded: \n' +
            'Country: \t' + configs[0].CountryLong + '\n' +
            'IP: \t\t' + configs[0].IP + '\n' +
            'Operator: \t' + configs[0].Operator + '\n\n\n'
        );

        _this._prepareOpenVpnConfig(configs[0].OpenVPN_ConfigData_Base64);
        _this._openvpnProc = spawn('openvpn', [_this._openVpnConfigFile]);
        _this._openvpnProc.stdout.on('data', function (data) {

            data = data.toString();

            console.info(data);

            if (data.match('Initialization Sequence Completed')) {
                console.info('\n\t\t\tVPN connection established!\n');
            } else if (data.match('Operation not permitted')) {
                throw new Error('Operation not permitted');
            }

        });

        return _this._openvpnProc;
    });

};

DEBUG && console.log(process.argv);

(new VpnGate()).connect(process.argv[2]);