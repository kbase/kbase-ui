/*global define*/
/*jslint white:true*/
/*
 * Deploy is is run after a production build has been completed. The production
 * build will be located in /dist.
 * 
 * This deploy script should be able to target multiple platorms or operating
 * environments. For instance, it may copy the files, configure the server, install
 * startup scripts, and start the server; or it may copy nginx config files, test nginx,
 * and start up nginx.
 * 
 * But for now simply copies the dist directory into the location
 * pointed to in the config file.
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
    underscore = require('underscore');


function evaluateSystem(state) {
    return Promise.try(function () {
        return state;
    });
}

// TODO: read dev/config/config.yml
var uiTargetKey = process.argv[2] || 'dev';
var kbDeployKey = process.argv[3] || 'ci';

function loadDeployConfig(state) {
    var root = state.environment.path,
        fileName = 'deploy-' + state.config.build.targets.kbDeployKey + '.cfg';
    return mutant.loadIni(root.concat(['dev', 'config', 'deploy', fileName]))
        .then(function (kbDeployConfig) {
            return state.config.kbDeployConfig = kbDeployConfig;
        });
}

function loadBuildConfig(state) {
    return mutant.loadYaml(['..', 'dev', 'config', 'build' + '.yml'])
}


evaluateSystem({
    config: {
    },
    environment: {
        path: mutant.rtrunc(process.cwd().split('/'), 1)
    }
})
    .then(function (state) {
	    return [state, loadBuildConfig(state)];
    })
    .spread(function (state, config) {
	    state.config.build =  config;
	    return state;
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
        var sourceDir = state.environment.path.concat(['dev', 'dist', 'client']),
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
