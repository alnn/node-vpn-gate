'use strict';

var execSync = require('child_process').execSync;

var isWin = process.platform == 'win32';

var isExistsUnix = function(cmd) {
  try {
    var stdout = execSync('command -v ' + cmd +
      ' 2>/dev/null' +
      ' && { echo >&1 \'' + cmd + ' found\'; exit 0; }'
    );
    return !!stdout;
  } catch (error) {
    return false;
  }
};

var isExistsWin = function(cmd) {
  try {
    var stdout = execSync('where ' + cmd);
    return !!stdout;
  } catch (error) {
    return false;
  }
};

module.exports = function(cmd) {
  return isWin ? isExistsWin(cmd) : isExistsUnix(cmd);
};
