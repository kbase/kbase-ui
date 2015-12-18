/*
 * MUTANT
 * Not a build system, a mutation machine.
 * 
 */

/*
 * Here is the idea of mutant. It decomposes the build process into a map of mutation
 * machines. The initial raw material + inputs enters the first process, which
 * works on it, then passes it to a second, and so forth.
 * 
 * The main ideas are:
 * - the system travels between processes, does not exist anywhere else.
 * - each process may mutate the system, and must pass those mutations to 
 *   the next process.
 * - processes are just javascript, so may include conditional branching, etc.
 * - procsses are asynchronous by nature, promises, so may arbitrarily contain 
 *   async tasks, as long as they adhere to the promises api.
 *   
 */

/*global define*/
/*jslint white:true*/
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

var uiTarget = process.argv[2] || 'dev';
var deployTarget = process.argv[3] || 'ci';

evaluateSystem({
    uiTarget: uiTarget,
    deployTarget: deployTarget
})
    .then(function (state) {
        // remove mutant files
        return [state, fs.removeAsync(['mutantfiles'].join('/'))];
        // remove build and dist dirs in /dev
    })
    .spread(function (state) {
        return [state, fs.removeAsync(['..', 'dev', 'build'].join('/'))];
    })
    .spread(function (state) {
        return [state, fs.removeAsync(['..', 'dev', 'dist'].join('/'))];
    })
    .catch(function (err) {
        console.log('ERROR');
        console.log(err);
    });
