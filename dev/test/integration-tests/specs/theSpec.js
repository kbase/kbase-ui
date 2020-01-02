/* see http://webdriver.io/api */
/*eslint-env node*/
/*eslint strict: ["error", "global"] */

'use strict';

const runner = require('./runner');
const utils = require('./utils');
const glob = require('glob');
const path = require('path');

const jsonFiles = glob.sync('plugins/*/*.json', {
    nodir: true,
    absolute: true,
    cwd: __dirname
});

const yamlFiles = glob.sync('plugins/*/*.@(yml|yaml)', {
    nodir: true,
    absolute: true,
    cwd: __dirname
});

const commonSpecs = glob
    .sync('common/*.yaml', {
        nodir: true,
        absolute: true,
        cwd: __dirname
    })
    .reduce(function (common, match) {
        common[path.basename(match, '.yaml')] = utils.loadYAMLFile(match);
        return common;
    }, {});

const pluginTests = jsonFiles
    .map(function (file) {
        return utils.loadJSONFile(file);
    })
    .concat(
        yamlFiles.map(function (file) {
            return utils.loadYAMLFile(file);
        })
    );

const testData = utils.loadJSONFile(__dirname + '/../config.json');

const testSuite = new runner.Suite({
    testFiles: pluginTests,
    commonSpecs,
    testData
});

testSuite.run();
