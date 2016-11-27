'use strict';

var BBPromise = require("bluebird"),
  fs = BBPromise.promisifyAll(require('fs')),
  request = BBPromise.promisify(require('request')),
  path = require('path'),
  appConf = require('./../configs/config'),
  csvData = '',
  errors = [],
  pulled = false;

module.exports = (function() {

  // Set current directory to application directory
  try {
    process.chdir(getAppDir());
  } catch (err) {
    errors.push('Warning: Application directory unreachable: '+ err);
  }

  /**
  * Get application directory and create it if not exist
  * @returns {string}
  */
  function getAppDir() {
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

    return appDir;
  }

  /**
   * Pull csv string by provided in application config url
   * @returns {BBPromise.<T>|*}
   */
  function pull() {
    return request(appConf.sourceURL).then(function(result) {
      pulled = true;
      if (result.error) {
        errors.push(result.error);
      }
      if (result.error || result.statusCode !== 200) {
        return '';
      }
      return result.body;
    });
  }

  /**
  * Save csv data to the file
  * @param csv
  * @returns {BBPromise.<T>|*}
  */
  function save(csv) {
    return fs.writeFileAsync(appConf.csvFileName, csv, 'utf8')
      .catch(function(err) {
        errors.push(err.message);
      })
      .then(function() {
        return csv;
      });
  }

  /**
  * Cache loaded data
  * @param csv
  * @param callback
  */
  function setUp(csv, callback) {
    csvData = csv;
    if ('function' === typeof callback) {
      csv = callback(csv);
    }
    return csv;
  }

  /**
   * Check that csv file life time is expired
   * @returns {boolean}
   */
  function isExpired() {
    var fileStat;

    try {
      fileStat = fs.statSync(appConf.csvFileName);
    } catch (error) {
      if (error.code == 'ENOENT') {
        // File does not exist, silently ignore
      }
    } finally {
      return !fileStat || (new Date()).getTime() - fileStat.ctime.getTime() >= appConf.csvLifeTime;
    }
  }

  return {

    /**
     * Load csv data and return promise
     * @param callback
     * @param loadAnyWay
     * @returns {BBPromise.<T>|*}
     */
    load: function(callback, loadAnyWay) {
      var afterLoad = function(csv) {
        return setUp(csv, callback);
      };

      if (isExpired() || loadAnyWay) {
        return pull().then(save).then(afterLoad);
      } else {
        pulled = false;
        return fs.readFileAsync(appConf.csvFileName, 'utf8').then(afterLoad);
      }
    },

    /**
     * Returns function to that will search csv data by provided parameters
     * @param searchField
     * @param options
     * @param inputCSV
     * @returns {Function}
     */
    getSearch: function(searchField, options, inputCSV) {
      var outputData,
        cols;
      if (!inputCSV) {
        inputCSV = csvData;
      }
      outputData = inputCSV.trim("\n").split("\n").map(function(line) {
        if (options && options.commentChar && line.substr(0, options.commentChar.length) === options.commentChar) {
          return;
        }
        return line.split(",");

      }).filter(function(line) {
        return line !== undefined;
      });

      cols = outputData[0].reduce(function(item, val, index) {
        item[val.trim('\r')] = (index + '').trim('\r');
        return item;
      }, {});

      searchField = "string" === typeof searchField ? [searchField]: searchField;

      return function(column) {
        var result = [],
          rowSuitable;

        rowSuitable = function(rowData) {
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
      };

    },

    getCsv: function() {
      return csvData;
    },

    getErrors: function() {
      return errors;
    },

    isPulled: function() {
      return pulled;
    }
  };
}());
