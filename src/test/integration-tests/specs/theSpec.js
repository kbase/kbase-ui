/* see http://webdriver.io/api */
/*eslint-env node*/
/*eslint strict: ["error", "global"] */

'use strict';

var runner = require('./runner');
var glob = require('glob');
var path = require('path');

var jsonFiles = glob.sync('plugins/*/*.json', {
    nodir: true,
    absolute: true,
    cwd: __dirname
});

var yamlFiles = glob.sync('plugins/*/*.@(yml|yaml)', {
    nodir: true,
    absolute: true,
    cwd: __dirname
});

var common = glob
    .sync('common/*.json', {
        nodir: true,
        absolute: true,
        cwd: __dirname
    })
    .reduce(function (common, match) {
        common[path.basename(match, '.json')] = runner.loadJSONFile(match);
        return common;
    }, {});

var pluginTests = jsonFiles
    .map(function (file) {
        return runner.loadJSONFile(file);
    })
    .concat(
        yamlFiles.map(function (file) {
            return runner.loadYAMLFile(file);
        })
    );

pluginTests.forEach(function (tests) {
    return runner.runTests(tests, common);
});
