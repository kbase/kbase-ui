/* see http://webdriver.io/api */
/*eslint-env node*/
/*eslint strict: ["error", "global"] */

'use strict';

var runner = require('./runner');
var glob = require('glob');
var path = require('path');
var fs = require('fs');

var files = glob.sync('plugins/*/*.json', {
    nodir: true,
    cwd: __dirname
});

function loadFile(path) {
    var content = fs.readFileSync(path);
    return JSON.parse(content);
}

var common = glob.sync('common/*.json', {
    nodir: true,
    absolute: true,
    cwd: __dirname
}).reduce(function (common, match) {
    common[path.basename(match, '.json')] = loadFile(match);
    return common;
}, {});


var pluginTests = files.map(function (file) {
    return runner.load(file);
});

pluginTests.forEach(function (script) {
    return runner.runTests(script, common);
});
