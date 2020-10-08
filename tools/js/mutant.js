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

/*eslint-env node*/
/*eslint {strict: ['error', 'global']}*/
'use strict';

const findit = require('findit2');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const glob = Promise.promisify(require('glob').Glob);
const yaml = require('js-yaml');
const ini = require('ini');
const chalk = require('chalk');
const path = require('path');
const uniqState = {};

// UTILS

function copyFiles(tryFrom, tryTo, globExpr) {
    return Promise.all([fs.realpathAsync(tryFrom.join('/')), fs.realpathAsync(tryTo.join('/'))])
        .spread(function (from, to) {
            return [
                from.split('/'),
                to.split('/'),
                glob(globExpr, {
                    cwd: from,
                    nodir: true
                })
            ];
        })
        .spread(function (from, to, matches) {
            return Promise.all(
                matches.map(function (match) {
                    const fromPath = from.concat([match]).join('/'),
                        toPath = to.concat([match]).join('/');
                    return fs.copy(fromPath, toPath, {});
                })
            );
        });
}

// function copyFiles(from, to, globExpr) {
//     return glob(globExpr, {
//         cwd: from.join('/'),
//         nodir: true
//     })
//         .then(function (matches) {
//             return Promise.all(matches.map(function (match) {
//                 var fromPath = from.concat([match]).join('/'),
//                     toPath = to.concat([match]).join('/');
//                 return fs.copy(fromPath, toPath, {});
//             }));
//         });
// }

function ensureEmptyDir(path) {
    const dir = path.join('/');

    // ensure dir
    return fs
        .ensureDirAsync(dir)
        .then(function () {
            return fs.readdirAsync(dir);
        })
        .then(function (files) {
            if (files.length > 0) {
                throw new Error('Directory is not empty: ' + dir);
            }
        });
}

function loadDockerEnvFile(path) {
    let filePath;
    if (typeof path === 'string') {
        filePath = path;
    } else {
        filePath = path.join('/');
    }
    return fs.readFileAsync(filePath, 'utf8').then(function (contents) {
        return contents.split('\n').reduce(function (lines, line) {
            line = line.trimLeft();
            if (line.trim().length === 0) {
                return lines;
            } else if (line[0] === '#') {
                return lines;
            }
            const pos = line.indexOf('=');
            if (pos === -1) {
                lines[key] = null;
                return lines;
            }
            const key = line.slice(0, pos);
            const value = line.slice(pos + 1);
            lines[key] = value;
            return lines;
        }, {});
    });
}

function loadYaml(path) {
    const yamlPath = Array.isArray(path) ? path.join('/') : path;
    return fs.readFileAsync(yamlPath, 'utf8').then(function (contents) {
        try {
            return yaml.safeLoad(contents);
        } catch (ex) {
            console.error('Error loading yaml', ex, contents);
            throw new Error('Error loading yaml: ' + ex.message);
        }
    });
}

function loadJson(path) {
    return fs.readFileAsync(path.join('/'), 'utf8').then(function (contents) {
        return JSON.parse(contents);
    });
}

function saveYaml(path, data) {
    return fs.writeFileAsync(path.join('/'), yaml.safeDump(data));
}

function loadIni(iniPath) {
    const yamlPath = iniPath.join('/');
    return fs.readFileAsync(yamlPath, 'utf8').then(function (contents) {
        return ini.parse(contents);
    });
}

function rtrunc(array, len) {
    const start = 0,
        end = array.length - len;
    return array.slice(start, end);
}

function saveIni(path, iniData) {
    return fs.writeFileAsync(path.join('/'), ini.stringify(iniData));
}

function saveJson(path, jsonData) {
    return fs.writeFileAsync(path.join('/'), JSON.stringify(jsonData, null, 4));
}

function uniq(prefix) {
    if (!uniqState[prefix]) {
        uniqState[prefix] = 0;
    }
    uniqState[prefix] += 1;
    return prefix + String(uniqState[prefix]);
}

function uniqts(prefix) {
    const ts = new Date().getTime();
    return prefix + String(ts);
}

function mkdir(inPath, dirPath) {
    const path = inPath.concat(dirPath),
        pathString = path.join('/');
    if (fs.existsSync(pathString)) {
        throw new Error('Sorry, this dir already exists: ' + pathString);
    }
    fs.ensureDirSync(pathString);
    return path;
}

function ensureDir(path) {
    return fs.ensureDirSync(path.join('/'));
}

function copydir(fromRoot, fromDir, toRoot, toDir) {
    const fromPath = fromRoot.concat(fromDir).join('/'),
        toPath = toRoot.concat(toDir).join('/');
    fs.copySync(fromPath, toPath);
}

function copyfile(fromRoot, fromDir, toRoot, toDir) {
    const fromPath = fromRoot.concat(fromDir).join('/'),
        toPath = toRoot.concat(toDir).join('/');
    fs.copySync(fromPath, toPath);
}

function deleteMatchingFiles(path, regex) {
    return new Promise(function (resolve, reject) {
        const finder = findit(path);
        let loadingFiles = true;
        const processingFiles = {};
        finder.on('file', function (file) {
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

function copyState(oldState) {
    return Promise.try(function () {
        if (!oldState.buildConfig.mutate) {
            const newState = JSON.parse(JSON.stringify(oldState));
            const tempDir = uniq('temp_');
            const newFs = [tempDir];
            let start = new Date().getTime();

            // Give the next process a fresh copy of all the files.
            newState.environment.filesystem = newFs;
            newState.environment.path = newState.environment.root.concat(newFs);

            newState.copyTime = new Date().getTime() - start;
            start = new Date().getTime();

            return fs.copyAsync(oldState.environment.path.join('/'), newState.environment.path.join('/')).then(function () {
                return newState;
            });
        }
        return oldState;
    });
}

function makeRunDir(state) {
    const runDirName = uniqts('run_');
    // This is the root of all process files
    const root = (state.buildConfig.tempDir && ['..'].concat(state.buildConfig.tempDir.split('/'))) || ['mutantfiles'];
    const runDir = mkdir(root, [runDirName]);
    state.environment.root = runDir;
    return state;
}

function removeRunDir(state) {
    if (state.environment.root) {
        return fs.removeAsync(state.environment.root.join('/')).then(function () {
            return state;
        });
    }
    return state;
}

function timestamp() {
    return new Date().toISOString();
}

function log(msg) {
    return info(msg);
}

function info(msg) {
    const line = 'INFO: ' + timestamp() + ': ' + msg;
    const chalked = chalk.blue(line);
    process.stdout.write(chalked);
    process.stdout.write('\n');
}

function warn(msg) {
    const line = 'WARN: ' + timestamp() + ': ' + msg;
    const chalked = chalk.yellow(line);
    process.stdout.write(chalked);
    process.stdout.write('\n');
}

function success(msg) {
    const line = '✔   : ' + timestamp() + ': ' + msg;
    const chalked = chalk.green(line);
    process.stdout.write(chalked);
    process.stdout.write('\n');
}

function mergeObjects(listOfObjects) {
    const simpleObjectPrototype = Object.getPrototypeOf({});

    function isSimpleObject(obj) {
        return Object.getPrototypeOf(obj) === simpleObjectPrototype;
    }

    function merge(obj1, obj2, keyStack) {
        Object.keys(obj2).forEach(function (key) {
            const obj1Value = obj1[key];
            const obj2Value = obj2[key];
            const obj1Type = typeof obj1Value;
            // var obj2Type = typeof obj2Value;
            if (obj1Type === 'undefined') {
                obj1[key] = obj2[key];
            } else if (isSimpleObject(obj1Value) && isSimpleObject(obj2Value)) {
                keyStack.push(key);
                merge(obj1Value, obj2Value, keyStack);
                keyStack.pop();
            } else {
                console.error('UNMERGABLE', obj1Type, obj1Value);
                throw new Error('Unmergable at ' + keyStack.join('.') + ':' + key);
            }
        });
    }

    const base = JSON.parse(JSON.stringify(listOfObjects[0]));
    for (let i = 1; i < listOfObjects.length; i += 1) {
        merge(base, listOfObjects[i], []);
    }
    return base;
}

function createInitialState({rootDir, initialFilesystem, buildControlConfigPath, buildControlDefaultsPath}) {
    log('Creating initial state');

    return Promise.all([loadYaml(rootDir.concat(buildControlConfigPath)), loadYaml(rootDir.concat(buildControlDefaultsPath))])
        .then((configs) => {
            const buildConfig = mergeObjects(configs);
            const state = {
                environment: {},
                data: {},
                state: {},
                buildConfig,
                history: []
            };
            return makeRunDir(state);
        })
        .then((state) => {
            const inputFiles = mkdir(state.environment.root, ['inputfiles']);
            const inputFs = [];

            // We first copy the input directories into the input filesystem
            initialFilesystem.forEach((spec) => {
                if (spec.path) {
                    copydir(rootDir, spec.path, [], inputFiles.concat(spec.path));
                } else if (spec.files) {
                    spec.files.forEach((file) => {
                        copyfile(rootDir, file, [], inputFiles.concat([file]));
                    });
                }
            });

            // And also create a temp staging dir for build processes to
            // place files
            mkdir(state.environment.root.concat(['inputfiles']), 'tmp');

            inputFs.push('inputfiles');

            state.environment.filesystem = inputFs;
            state.environment.path = state.environment.root.concat(inputFs);

            state.stats = {
                start: new Date().getTime()
            };

            return state;
        });
}

function finish(state) {
    return Promise.try(() => {
        if (!state.buildConfig.keepBuildDir) {
            return removeRunDir(state);
        }
    }).then(() => {
        log('Finished with mutations');
    });
}

async function removeSourceMappingCSS(rootPath) {
    const mapRe = /\/\*#\s*sourceMappingURL.*\*\//m;
    const pattern = rootPath
        .concat(['**', '*.css'])
        .join('/');

    // remove mapping from css files.
    const matches = await glob(
        pattern,
        {
            nodir: true
        }
    );

    log(`Removing source mapping from ${matches.length} CSS files`);
    // matches.forEach((match) => {
    //     log(match);
    // })

    await Promise.all(
        matches.map(function (match) {
            return fs.readFileAsync(match, 'utf8').then(function (contents) {
                // replace the map line with an empty string
                if (!mapRe.test(contents)) {
                    return;
                }
                console.warn('Fixing up CSS file to remove mapping');
                console.warn(match);

                const fixed = contents.replace(mapRe, '');
                return fs.writeFileAsync(match, fixed);
            });
        })
    );
}

async function removeSourceMappingJS(rootPath) {
    const mapRe = /^\/\/#\s*sourceMappingURL.*$/m;
    const pattern = rootPath
        .concat(['**', '*.js'])
        .join('/');

    // remove mapping from css files.
    const matches = await glob(
        pattern,
        {
            nodir: true
        }
    );

    log(`Removing source mapping from ${matches.length} JS files`);

    await Promise.all(
        matches.map(function (match) {
            return fs.readFileAsync(match, 'utf8').then(function (contents) {
                // replace the map line with an empty string
                if (!mapRe.test(contents)) {
                    return;
                }
                console.warn('Fixing up JS file to remove mapping');
                console.warn(match);

                const fixed = contents.replace(mapRe, '');
                return fs.writeFileAsync(match, fixed);
            });
        })
    );

}

module.exports = {
    createInitialState,
    finish,
    deleteMatchingFiles,
    copyState,
    copyFiles,
    ensureEmptyDir,
    loadYaml,
    saveYaml,
    loadIni,
    saveIni,
    loadJson,
    saveJson,
    rtrunc,
    info,
    log,
    warn,
    success,
    mergeObjects,
    loadDockerEnvFile,
    ensureDir,
    removeSourceMappingJS,
    removeSourceMappingCSS
};
