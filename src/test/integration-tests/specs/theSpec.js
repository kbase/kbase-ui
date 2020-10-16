/* see http://webdriver.io/api */
/*eslint-env node*/
/*eslint strict: ["error", "global"] */

'use strict';

const runner = require('./runner');
const utils = require('./utils');
const glob = require('glob');
const path = require('path');
const {Merger} = require('./merger');

function loadData(config) {
    const dataFiles = glob.sync(`plugins/*/data/${config.env}/*.json`, {
        nodir: true,
        absolute: true,
        cwd: __dirname
    });

    // merge all the configs in this dir.
    const someData = {};
    dataFiles.forEach((file) => {
        const pluginData = utils.loadJSONFile(file);
        Object.assign(someData, pluginData);
        const pluginName = file.split('/').slice(-4)[0];
        if (!someData[pluginName]) {
            someData[pluginName] = {};
        }
        Object.assign(someData[pluginName], pluginData);
    });

    return someData;
}

function main() {
    // focus allows the user to select which tests to run by one or
    // more regexes.
    const foci = (() => {
        if (!process.env.FOCUS) {
            return [];
        }
        return process.env.FOCUS.split(' ')
            .filter((focus) => {
                return (focus.length > 0);
            })
            .map((focus) => {
                return new RegExp(focus);
            });
    })();

    const blurs = (() => {
        if (!process.env.BLUR) {
            return [];
        }
        return process.env.BLUR.split(' ')
            .filter((blur) => {
                return (blur.length > 0);
            })
            .map((blur) => {
                return new RegExp(blur);
            });
    })();

    const cwd = `${__dirname}/plugins`;
    const jsonFiles = glob.sync('*/*.json', {
        nodir: true,
        absolute: false,
        cwd
    })
        .filter((file) => {
            if (foci.length !== 0) {
                return foci.some((focus) => {
                    return focus.test(file);
                });
            }
            if (blurs.length !== 0) {
                return !blurs.some((blur) => {
                    return blur.test(file);
                });
            }
            return true;
        });

    const yamlFiles = glob.sync('*/*.@(yml|yaml)', {
        nodir: true,
        absolute: false,
        cwd
    })
        .filter((file) => {
            if (foci.length !== 0) {
                return foci.some((focus) => {
                    return focus.test(file);
                });
            }
            if (blurs.length !== 0) {
                return !blurs.some((blur) => {
                    return blur.test(file);
                });
            }
            return true;
        });

    const subTasks = glob
        .sync('subtasks/*.yaml', {
            nodir: true,
            absolute: true,
            cwd: __dirname
        })
        .reduce(function (subTasks, match) {
            subTasks[path.basename(match, '.yaml')] = utils.loadYAMLFile(match);
            return subTasks;
        }, {});

    const pluginTests = jsonFiles
        .map(function (file) {
            return utils.loadJSONFile(`${cwd}/${file}`);
        })
        .concat(
            yamlFiles.map(function (file) {
                return utils.loadYAMLFile(`${cwd}/${file}`);
            })
        );

    // Fix up the tests.
    pluginTests.forEach((test) => {
        if (test.specs) {
            test.cases = test.specs;
            delete test.specs;
        }
    });

    // Build the configuration.
    // The configuration is per-deploy-environment.
    // Each environment is an entry in the env property
    // THe envDefault config property is applied to all environments.
    const rawConfig = utils.loadJSONFile(__dirname + '/../config.json');
    const envConfig = rawConfig.envs.reduce((config, envConfig) => {
        const theEnvConfig = new Merger(rawConfig.envDefault).mergeIn(envConfig).value();
        if (theEnvConfig.noHostPrefix) {
            theEnvConfig.url = 'https://kbase.us';
        } else {
            theEnvConfig.url = `https://${theEnvConfig.hostPrefix || theEnvConfig.env}.kbase.us`;
        }
        // theEnvConfig.url = `https://${hostPrefix}.kbase.us`;
        config[theEnvConfig.env] = theEnvConfig;

        // Handle other environments which are essential wrappers around a canonical one.
        // E.g. narrative-dev, narrative-refactor, appdev
        if (envConfig.aliases) {
            envConfig.aliases.forEach((alias) => {
                const theEnvConfig = new Merger(rawConfig.envDefault).mergeIn(envConfig).value();
                theEnvConfig.url = `https://${alias.env}.kbase.us`;
                config[alias.env] = theEnvConfig;
            });
        }

        return config;
    }, {})[process.env.ENV];
    const config = new Merger(rawConfig.envDefault).mergeIn(envConfig).value();

    /* eslint no-console: [0] */
    const plugins = loadData({env: process.env.ENV});
    const context = {
        config,
        plugins,
        env: process.env // safe?
    };

    const testSuite = new runner.Suite({
        testFiles: pluginTests,
        subTasks,
        context
    });

    testSuite.run();
}

main();
