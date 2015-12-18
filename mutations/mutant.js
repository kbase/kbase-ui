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

var findit = require('findit2'),
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs-extra')),
    uniqState = {};

function uniq(prefix) {
    if (!uniqState[prefix]) {
        uniqState[prefix] = 0;
    }
    uniqState[prefix] += 1;
    return prefix + String(uniqState[prefix]);
}

function uniqts(prefix) {
    var ts = (new Date()).getTime();
    return prefix + String(ts);
}

function mkdir(inPath, dirPath) {
    var path = inPath.concat(dirPath),
        pathString = path.join('/');
    if (fs.exists(pathString)) {
        throw new Error('Sorry, this dir already exists: ' + pathString);
    }
    fs.ensureDirSync(pathString);
    return path;
}

function copydir(fromRoot, fromDir, toRoot, toDir) {
    var fromPath = fromRoot.concat(fromDir).join('/'),
        toPath = toRoot.concat(toDir).join('/');
    fs.copySync(fromPath, toPath);
}

function copyfile(fromRoot, fromDir, toRoot, toDir) {
    var fromPath = fromRoot.concat(fromDir).join('/'),
        toPath = toRoot.concat(toDir).join('/');
    fs.copySync(fromPath, toPath);
}

function deleteMatchingFiles(path, regex) {
    return new Promise(function (resolve, reject) {
        var finder = findit(path),
            loadingFiles = true,
            processingFiles = {};
        finder.on('file', function (file, stat, linkPath) {
            if (file.match(regex)) {
                processingFiles[file] = true;
                fs.unlink(file, function (err) {
                    if (err) {
                        finder.done();
                        reject(err);
                    } else {
                        delete processingFiles[file];
                        if (!loadingFiles && Object.keys(processingFiles).length === 0) {
                            resolve();
                        }
                    }
                });
            }
        });
        finder.on('end', function () {
            loadingFiles = false;
            if (Object.keys(processingFiles).length === 0) {
                resolve();
            }
        });
    });
}

function mutate(app, state, next) {
    var history = [state];
    return new Promise(function (resolve, reject, update) {
        return engine(app, state, next, history, resolve, reject, update);
    })
        .then(function (result) {
            return {
                result: result,
                history: history
            };
        });
}

function copyState(oldState) {
    return Promise.try(function () {
        var newState = JSON.parse(JSON.stringify(oldState)),
            tempDir = uniq('temp_'),
            newFs = [tempDir],
            oldFs = oldState.environment.filesystem,
            start = (new Date()).getTime();

        // Give the next process a fresh copy of all the files.
        newState.environment.filesystem = newFs;
        newState.environment.path = newState.environment.root.concat(newFs);

        newState.copyTime = (new Date()).getTime() - start;
        start = (new Date()).getTime();

        return fs.copyAsync(oldState.environment.path.join('/'), newState.environment.path.join('/'))
            .then(function () {
                return newState;
            });
    });
}

// ENGINE
// The little one that could.
function engine(app, oldState, next, stateHistory, resolve, reject, update) {
    return Promise.try(function () {
        var nextProcess = app[next].process;
        if (nextProcess) {
            try {
                // make our filesystem.
                var result,
                    state = JSON.parse(JSON.stringify(oldState)),
                    tempDir = uniq('temp_'),
                    newFs = [tempDir],
                    oldFs = state.environment.filesystem,
                    start = (new Date()).getTime();

                // Give the next process a fresh copy of all the files.
                state.environment.filesystem = newFs;
                state.environment.path = state.environment.root.concat(newFs);
                state.environment.name = next;
                copydir(state.environment.root, oldFs, state.environment.root, newFs);
                state.copyTime = (new Date()).getTime() - start;
                start = (new Date()).getTime();

                // Run the next process with the fresh state. The state
                // should now be modified (and is also returned in the 
                // result.)
                return nextProcess(state)
                    .then(function (result) {
                        state.processTime = (new Date()).getTime() - start;
                        stateHistory.push(state);
                        if (result[1]) {
                            return engine(app, result[0], result[1], stateHistory, resolve, reject, update)
                                .then(function () {
                                });
                        } else {
                            // console.log(arguments);
                            resolve(result[0]);
                        }
                    })
                    .catch(function (err) {
                        console.log('ERROR in the process: ' + next);
                        console.log(err);
                        console.log(err.stack);
                        reject(err);
                    });
            } catch (ex) {
                console.log('ERROR in the process: ' + next);
                console.log(ex);
                console.log(ex.stack);
                reject(ex);
            }
        } else {
            console.log('$$$$$$$$$ DONE $$$$$$$$$$$');
        }
    });
}

function createInitialState(initialFilesystem, initialData) {
    
    // TODO: do this better...
    var appName;    
    if (process.argv[0].match(/node$/)) {
        appName = process.argv[1];
    } else {
        appName = process.argv[0];
    }
    
    return fs.readFileAsync(appName + '.json', 'utf8')
        .then(function (configFile) {
            return JSON.parse(configFile);
        })
        .then(function (config) {
            var runDirName = uniqts('run_'),
                // This is the root of all process files
                runDir = mkdir(['mutantfiles'], [runDirName]),
                // This is the "input" filesystem
                inputFiles = mkdir(runDir, ['inputfiles']),
                inputFs = [];

            // We first copy the input directories into the input filesystem
            initialFilesystem.forEach(function (spec) {
                if (spec.path) {
                    copydir(spec.cwd, spec.path, [], inputFiles.concat(spec.path));
                } else if (spec.files) {
                    spec.files.forEach(function (file) {
                        copyfile(spec.cwd, file, [], inputFiles.concat([file]));
                    });
                }
            });

            inputFs = ['inputfiles'];

            return {
                // A path to the root filesystem for the current state    
                environment: {
                    // root for the above filesystem.
                    root: runDir,
                    filesystem: inputFs,
                    path: runDir.concat(inputFs)
                },
                data: initialData,
                state: {
                },
                config: config,
                history: []
            };
        });
}

module.exports = {
    mutate: mutate,
    createInitialState: createInitialState,
    deleteMatchingFiles: deleteMatchingFiles,
    copyState: copyState
};