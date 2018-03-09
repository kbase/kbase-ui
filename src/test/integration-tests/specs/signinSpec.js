/* see http://webdriver.io/api */

'use strict';

var runner = require('./runner');
var glob = require('glob');

var files = glob.sync('plugins/*/*.json', {
    nodir: true,
    cwd: __dirname
});

var pluginTests = files.map(function (file) {
    return runner.load(file);
});

pluginTests.forEach(function (tests) {
    return runner.runTests(tests);
});
