"use strict";
var Promise = require("bluebird"),
    request = Promise.promisify(require('request')),
    tmp     = Promise.promisifyAll(require('tmp')),
    fs      = Promise.promisifyAll(require('fs')),
    spawn   = require('child_process').spawn,
    EventEmitter    = require('events').EventEmitter,
    events  = new EventEmitter(),
    path    = require('path'),
    readline        = require('readline'),
    DEBUG   = false;

//console.log(events);

function VpnGate() {

    var _self = this;

    this._csvUrl     = 'http://www.vpngate.net/api/iphone/';
    this._csvFile    = 'vpn-gate.csv';
    this._csvFileLifeTime    = 3600 * 1000; // 1 hour
    this._openVpnConfigFile  = null;
    this._openvpnProc        = null;
    this._currentConfig      = 0;
    this._currentCountry     = "";
    this._openvpnProc        = null;
    this._countries          = {};
    this._configs            = {};

    this._fails = {
        "Connection timed out": 0,
        "Connection reset, restarting": 0,
        "Interrupted system call": 0,
        "TLS handshake failed": 0,
        "No route to host": 0,
        "received, process exiting": 0
    };

    this._cli = readline.createInterface({
        input:  process.stdin,
        output: process.stdout
    });

    //console.log(this._cli);

    this._cli.render = function(options, processOutput) {
        readline.cursorTo(process.stdout, 0, 0);
        readline.clearScreenDown(process.stdout);
        this.write('\n' +
            '\tCountry: \t\t' + options.CountryLong + '\n' +
            '\tIP: \t\t\t' + options.IP + '\n' +
            '\tLine Throughput:\t' + (options.Speed / 1000000).toFixed(2) + ' Mbps\n' +
            '\tLine Ping: \t\t' + options.Ping + ' ms\n' +
            '\tOperator: \t\t' + options.Operator + '\n' +
            '\tStatus: \t\t' + options.status + '\n' +
            '\tID: \t\t' + _self._currentConfig + '\n' +
            //'\tOUTPUT: \t\t' + processOutput + '\n' +
            '\n(for more details go to http://localhost:9000)\n' +
            'Press q to quit'
        );
    };

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
        var
            plat    = process.platform,
            homeDir = process.env[(plat == 'win32') ? 'USERPROFILE' : 'HOME'],
            appDir;

        if (plat == 'win32') {
            appDir = path.join(homeDir, 'AppData', 'vpn-gate');
        } else {
            appDir = path.join(homeDir, '.vpn-gate');
        }

        if (!fs.existsSync(appDir)) {
            fs.mkdirSync(appDir);
        }

        DEBUG && console.log("appDir = ", appDir);

        return appDir;
    };

    this.on('retry', function() {

        this._currentConfig ++;

        this.startOpenvpn();
    });

}

VpnGate.prototype = events;

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

VpnGate.prototype.setCountries = function(csv) {
    var _self = this;
    this._compileCsvFinder(csv, [], {commentChar: '*'})().forEach(function(item) {
        _self._countries[item.CountryShort] = item.CountryLong;
    });
};

VpnGate.prototype.setConfigs = function(csv) {
    var _self = this;
    this._compileCsvFinder(csv, [], {commentChar: '*'})().forEach(function(item) {
        if (undefined === _self._configs[item.CountryShort]) {
            _self._configs[item.CountryShort] = [];
        }
        _self._configs[item.CountryShort].push(item);
    });
};

VpnGate.prototype.startOpenvpn = function() {

    var _this       = this,
        config      = this._configs[this._currentCountry][this._currentConfig];

    if (undefined === config) {
        this._currentConfig = 0;
        config = this._configs[this._currentCountry][this._currentConfig];
    }

    if (null !== this._openvpnProc) {
        this._openvpnProc.kill();
    }

    this._prepareOpenVpnConfig(config.OpenVPN_ConfigData_Base64);

    this._openvpnProc = spawn('openvpn', [this._openVpnConfigFile]);

    this._openvpnProc.stdout.on('data', function (data) {

        data = data.toString();
        //console.info(data);
        config.status = "Connecting...";

        if (data.match('Initialization Sequence Completed')) {

            config.status = "Connected!";

            _this.emit('connected', data);
        } else if (data.match('Operation not permitted')) {
            throw new Error('Operation not permitted');
        }

        for (var fail in _this._fails) {
            if (data.match(fail)) {
                _this.emit('retry');
                return;
            }
        }

        _this._cli.render(config, data);
        //console.info(data);
        //console.log(_this._currentConfig);
    });

    _this._openvpnProc.on('error', function(error) {

        _this.emit("error", error);

        if (error.code === 'ENOENT') {
            console.log('\t\tPlease install openvpn at first! https://openvpn.net\n');
            process.exit();
        } else {
            throw error;
        }
    });

    return _this._openvpnProc;
};


VpnGate.prototype.init = function(countryName) {
    var
        _this = this,
        appDir = this._getAppDir(),
        csvLoadPromise;

    this.emit("connect", countryName);

    try {
        process.chdir(appDir);
    } catch (err) {
        this._cli.write('Application directory unreachable: ' + err + "\n");
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
        var csvFinder   = _this._compileCsvFinder(csvString, ["CountryShort", "CountryLong"], {commentChar: '*'}),
            configs     = csvFinder(countryName);

        if (configs.length === 0) {
            throw new Error("Can't find config for country '" + countryName + "'");
        }

        _this.setCountries(csvString);
        _this.setConfigs(csvString);
        _this._currentCountry = configs[_this._currentConfig].CountryShort;

        return _this.startOpenvpn();
    });

};

//DEBUG && console.log(process.argv);

module.exports = new VpnGate();

/*
module.exports = {
    init: init,
    startOpenvpn: startOpenvpn,
};
*/

/*
(new VpnGate()).connect(process.argv[2]).then(function(openVpnProc) {

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
*/