/*global define*/
/*jslint white:true*/
/*
 * Configure a build or distribution.
 * 
 * For a given build of kbase-ui, which may be a "build" (original source forms),
 * "dist" (same files, but minified and scrubbed), or "deploy" (moved into the 
 * standard runtime location /kb/depolyment/services/kbase-ui)
 * this app ensures that the runtime (i.e. browser load time) configuration
 * complies with a given runtime config.
 * Effectively, this translates to a given runtime tag: ci, next, or prod.
 * Other runtime tags may be defined, the configure app expects a set of files
 * in certain locations named according to certain conventions.
 * 
 */
'use strict';

var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs-extra')),
    findit = require('findit2'),
    mutant = require('./mutant'),
    yaml = require('js-yaml'),
    bower = require('bower'),
    glob = Promise.promisify(require('glob').Glob),
    ini = require('ini'),
    underscore = require('underscore'),
    pathExists = require('path-exists');

function evaluateSystem(state) {
    return Promise.try(function () {
        return state;
    });
}

// TODO: read dev/config/config.yml
var runtimeTarget = process.argv[2] || 'dev';

function loadDeployConfig(state) {
    var root = state.environment.path,
        fileName = 'deploy-' + state.config.build.targets.deploy + '.cfg';
    return mutant.loadIni(state.config.root.concat(['deploy', fileName]))
        .then(function (kbDeployConfig) {
            return state.config.kbDeployConfig = kbDeployConfig;
        });
}

function loadBuildConfig(state) {
    return Promise.resolve(pathExists('../dev/config'))
        .then(function (devExists) {
            var configRoot;
            if (devExists) {
                configRoot = ['..', 'dev', 'config'];
                return [configRoot, mutant.loadYaml(configRoot.concat(['builds', state.config.type + '.yml']))];
            } else {
                configRoot = ['..', 'config'];
                return [configRoot, mutant.loadYaml(configRoot.concat(['builds', state.config.type + '.yml']))];
            }
        })
        .spread(function (configRoot, config) {
            state.config.build = config;
            state.config.root = configRoot;
            return state;
        });
}


function main(type) {
    evaluateSystem({
        config: {
            type: type
        },
        environment: {
            path: mutant.rtrunc(process.cwd().split('/'), 1)
        }
    })
        .then(function (state) {
            return loadBuildConfig(state);
        })
        .then(function (state) {
            return [state, loadDeployConfig(state)];
        })
        .spread(function (state) {
            var deployConfig = state.config.kbDeployConfig['kbase-ui'].deploy_target,
                deployPath = deployConfig.split('/');

            state.deployPath = deployPath;

            // Ensure the directory is there, yet has no files.
            return [state, mutant.ensureEmptyDir(deployPath)];
        })
        .spread(function (state) {
            var sourceDir = state.environment.path.concat(['build', 'dist', 'client']),
                destDir = state.deployPath;

            return [state, mutant.copyFiles(sourceDir, destDir, '**/*')];
        })
        .spread(function (state) {
            console.log('Successfully deployed to ' + state.deployPath.join('/'));
        })
        .catch(function (err) {
            console.log('ERROR');
            console.log(err);
        });
}


var type = process.argv[2] || 'deploy';

main(type);