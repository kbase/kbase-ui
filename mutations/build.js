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

/* eslint-env node */
'use strict';

var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs-extra')),
    path = require('path'),
    pathExists = require('path-exists'),
    mutant = require('./mutant'),
    yaml = require('js-yaml'),
    bower = require('bower'),
    glob = Promise.promisify(require('glob').Glob),
    exec = require('child_process').exec,
    dir = Promise.promisifyAll(require('node-dir')),
    util = require('util'),
    // disabled - uname package fails to install
    // uname = require('uname'),
    handlebars = require('handlebars');

// UTILS

function gitinfo(state) {
    function run(command) {
        return new Promise(function (resolve, reject) {
            exec(command, {}, function (err, stdout, stderr) {
                if (err) {
                    reject(err);
                }
                if (stderr) {
                    reject(new Error(stderr));
                }
                resolve(stdout);
            });
        });
    }
    // fatal: no tag exactly matches 'bf5efa0810d9f097b7c6ba8390f97c008d98d80e'
    return Promise.all([
        run('git show --format=%H%n%h%n%an%n%at%n%cn%n%ct%n%d --name-status | head -n 8'),
        run('git log -1 --pretty=%s'),
        run('git log -1 --pretty=%N'),
        run('git config --get remote.origin.url'),
        run('git rev-parse --abbrev-ref HEAD'),
        run('git describe --exact-match --tags $(git rev-parse HEAD)')
            .catch(function (err) {
                // For non-prod ui we can be tolerant of a missing version, but not for prod.
                if (state.buildConfig.target === 'prod') {
                    throw new Error('Not on a tag, cannot deploy');
                }
                console.warn('Not on a tag ... version will be unavailable');
                return '';
            })
    ])
        .spread(function (infoString, subject, notes, url, branch, tag) {
            var info = infoString.split('\n');
            var version;
            tag = tag.trim('\n');
            if (/^fatal/.test(tag)) {
                version = null;
            } else {
                var m = /^v([\d]+)\.([\d]+)\.([\d]+)$/.exec(tag);
                if (m) {
                    version = m.slice(1).join('.');
                } else {
                    version = null;
                }
            }
            return {
                commitHash: info[0],
                commitAbbreviatedHash: info[1],
                authorName: info[2],
                authorDate: new Date(parseInt(info[3]) * 1000).toISOString(),
                committerName: info[4],
                committerDate: new Date(parseInt(info[5]) * 1000).toISOString(),
                reflogSelector: info[6],
                subject: subject.trim('\n'),
                commitNotes: notes.trim('\n'),
                originUrl: url.trim('\n'),
                branch: branch.trim('\n'),
                tag: tag,
                version: version
            };
        });
}

function copyFiles(from, to, globExpr) {
    return glob(globExpr, {
        cwd: from.join('/'),
        nodir: true
    })
        .then(function (matches) {
            return Promise.all(matches.map(function (match) {
                var fromPath = from.concat([match]).join('/'),
                    toPath = to.concat([match]).join('/');
                return fs.copy(fromPath, toPath, {});
            }));
        });
}

function loadYaml(yamlPath) {
    yamlPath = yamlPath.join('/');
    return fs.readFileAsync(yamlPath, 'utf8')
        .then(function (contents) {
            return yaml.safeLoad(contents);
        });
}

// SUB TASKS

function arrayDiff(a, b) {
    if (a.length >= b.length) {
        return [];
    }
    var i;
    for (i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) {
            return [];
        }
    }
    return b.slice(i, b.length);
}

/*
 *
 * Copy files from one directory to another, creating any required directories,
 * but of course requiring the source to exist.
 */
function copyDirFiles(pathFrom, pathTo) {
    var from = pathFrom.join('/'),
        to = pathTo.join('/'),
        fromPath, toPath = pathTo;
    return fs.realpathAsync(from)
        .then(function (realpath) {
            fromPath = realpath.split('/');
            return dir.filesAsync(from);
        })
        .then(function (paths) {
            return Promise.all(paths.map(function (path) {
                return fs.realpathAsync(path)
                    .then(function (realpath) {
                        return realpath.split('/');
                    });
            }));
        })
        .then(function (realpaths) {
            return Promise.all(realpaths.map(function (filePath) {
                var dir = filePath.slice(0, filePath.length - 1),
                    relative = arrayDiff(fromPath, dir),
                    fileName = filePath[filePath.length - 1],
                    targetDir = toPath.concat(relative);
                // make the found paths relative.

                return fs.ensureDirAsync(targetDir.join('/'))
                    .then(function () {
                        return fs.copyAsync(filePath.join('/'), targetDir.concat([fileName]).join('/'));
                        // console.log(targetDir.concat([fileName]).join('/'));
                    });
            }));
        });
}

function dirList(dir) {
    return fs.readdirAsync(dir.join('/'))
        .then(function (files) {
            return files.map(function (file) {
                return dir.concat([file]);
            });
        })
        .then(function (files) {
            return Promise.all(files.map(function (file) {
                return fs.statAsync(file.join('/')).then(function (stats) {
                    return {
                        stats: stats,
                        path: file
                    };
                });
            }));
        })
        .then(function (files) {
            return files.filter(function (file) {
                return file.stats.isDirectory();
            });
        });
}

/*
 * Install any bower package which has an install config file at the top level.
 */

function installModule(state, source) {
    return loadYaml(source.concat(['install.yml']))
        .then(function (installConfig) {
            if (installConfig.moduleType === 'amd') {
                if (installConfig.package.type === 'namespaced') {
                    var from = source.concat(installConfig.package.path.split('/')),
                        to = state.environment.path.concat(['build', 'client', 'modules']);

                    return copyDirFiles(from, to);
                }
            }
        });
}

function installModulePackagesFromBower(state) {
    // iterate through all of the bower packages in root/bower_components
    var root = state.environment.path;

    return dirList(root.concat(['build', 'bower_components']))
        .then(function (dirs) {
            return Promise.all(dirs.map(function (dir) {
                return Promise.all([dir, pathExists(dir.path.concat('install.yml').join('/'))]);
            }));
        })
        .then(function (dirs) {
            return dirs
                .filter(function (dir) {
                    return dir[1];
                })
                .map(function (dir) {
                    return dir[0];
                });
        })
        .then(function (installDirs) {
            return Promise.all(installDirs.map(function (installDir) {
                return installModule(state, installDir.path);
            }));
        })
        .then(function () {
            return state;
        });
}

function installModulePackagesFromFilesystem(state) {
    // iterate through all of the bower packages in root/bower_components
    var root = state.environment.path;

    return dirList(root.concat(['build', 'bower_components']))
        .then(function (dirs) {
            return Promise.all(dirs.map(function (dir) {
                return Promise.all([dir, pathExists(dir.path.concat('install.yml').join('/'))]);
            }));
        })
        .then(function (dirs) {
            return dirs
                .filter(function (dir) {
                    return dir[1];
                })
                .map(function (dir) {
                    return dir[0];
                });
        })
        .then(function (installDirs) {
            return Promise.all(installDirs.map(function (installDir) {
                return installModule(state, installDir.path);
            }));
        })
        .then(function () {
            return state;
        });
}

function injectPluginsIntoBower(state) {
    // Load plugin config
    var root = state.environment.path,
        pluginConfig, pluginConfigFile = root.concat(['config', 'app', state.buildConfig.target, 'plugins.yml']).join('/'),
        bowerConfig, bowerConfigFile = root.concat(['build', 'bower.json']).join('/');
    return Promise.all([fs.readFileAsync(pluginConfigFile, 'utf8'), fs.readFileAsync(bowerConfigFile, 'utf8')])
        .spread(function (pluginFile, bowerFile) {
            pluginConfig = yaml.safeLoad(pluginFile);
            bowerConfig = JSON.parse(bowerFile);
        })
        .then(function () {
            // First ensure all plugin packages are installed via bower.
            pluginConfig.plugins
                .filter(function (plugin) {
                    if (typeof plugin === 'object' && !plugin.internal && plugin.source.bower) {
                        return true;
                    }
                    return false;
                })
                .forEach(function (plugin) {
                    var name = plugin.source.bower.name || plugin.globalName,
                        version = plugin.source.bower.version || plugin.version;
                    bowerConfig.dependencies[name] = version;
                });

            return fs.writeFileAsync(root.concat(['build', 'bower.json']).join('/'), JSON.stringify(bowerConfig, null, 4));
        });
}

/*
 *
 * Create the plugins load config from the plugins master config. The load config
 * just lists the plugins to be loaded. The master config also provides the locations
 * for external plugins.
 */
function injectPluginsIntoConfig(state) {
    // Load plugin config
    var root = state.environment.path,
        configPath = root.concat(['build', 'client', 'modules', 'config']),
        pluginConfigFile = root.concat(['config', 'app', state.buildConfig.target, 'plugins.yml']).join('/');

    return fs.ensureDirAsync(configPath.join('/'))
        .then(function () {
            return fs.readFileAsync(pluginConfigFile, 'utf8');
        })
        .then(function (pluginFile) {
            return yaml.safeLoad(pluginFile);
        })
        .then(function (pluginConfig) {
            var plugins = {};
            pluginConfig.plugins.forEach(function (pluginItem) {
                if (typeof pluginItem === 'string') {
                    plugins[pluginItem] = {
                        name: pluginItem,
                        directory: 'plugins/' + pluginItem,
                        disabled: false
                    };
                } else {
                    pluginItem.directory = 'plugins/' + pluginItem.name;
                    plugins[pluginItem.name] = pluginItem;
                }
            });

            // emulate the yaml file for now, or for ever.
            return fs.writeFileAsync(configPath.concat(['plugin.yml']).join('/'),
                yaml.safeDump({ plugins: plugins }));
        });
}

function bowerInstall(state) {
    return new Promise(function (resolve, reject) {
        var base = state.environment.path.concat(['build']).join('/');
        bower.commands
            .install(undefined, undefined, {
                cwd: base,
                timeout: 300000
            })
            .on('end', function (installed) {
                resolve(installed);
            })
            .on('error', function (err) {
                reject(err);
            });
    });
}

function copyFromBower(state) {
    var root = state.environment.path;

    return mutant.loadYaml(root.concat(['config', 'bowerInstall.yml']))
        .then(function (config) {
            var copyJobs = [];

            config.bowerFiles.forEach(function (cfg) {
                /*
                 The top level bower directory name is usually the name of the
                 package (which also is often also base of the sole json file name)
                 but since this is not always the case, we allow the dir setting
                 to override this.
                 */
                var dir = cfg.dir || cfg.name,
                    sources, cwd, dest;
                if (!dir) {
                    throw new Error('Either the name or dir property must be provided to establish the top level directory');
                }

                /*
                 The source defaults to the package name with .js, unless the
                 src property is provided, in which case it must be either a single
                 or set of glob-compatible strings.*/
                if (cfg.src) {
                    if (typeof cfg.src === 'string') {
                        sources = [cfg.src];
                    } else {
                        sources = cfg.src;
                    }
                } else if (cfg.name) {
                    sources = [cfg.name + '.js'];
                } else {
                    throw new Error('Either the src or name must be provided in order to have something to copy');
                }

                /*
                 Finally, the cwd serves as a way to dig into a subdirectory and use it as the
                 basis for copying. This allows us to "bring up" files to the top level of
                 the destination. Since we are relative to the root of this process, we
                 need to jigger that here.
                 */
                if (cfg.cwd) {
                    if (typeof cfg.cwd === 'string') {
                        cfg.cwd = cfg.cwd.split(/,/);
                    }
                    cwd = ['build', 'bower_components', dir].concat(cfg.cwd);
                } else {
                    cwd = ['build', 'bower_components', dir];
                }

                /*
                 The destination will be composed of 'bower_components' at the top
                 level, then the package name or dir (as specified above).
                 This is the core of our "thinning and flattening", which is part of the
                 point of this bower copy process.
                 In addition, if the spec includes a dest property, we will use that
                 */
                if (cfg.bowerComponent) {
                    dest = ['build', 'client', 'modules', 'bower_components'].concat([cfg.dir || cfg.name]);
                } else {
                    dest = ['build', 'client', 'modules'].concat([cfg.name]);
                }

                sources.forEach(function (source) {
                    copyJobs.push({
                        cwd: cwd,
                        src: source,
                        dest: dest
                    });
                });
            });

            // Create and execute a set of promises to fetch and operate on the files found
            // in the above spec.
            return Promise.all(copyJobs.map(function (copySpec) {
                return glob(copySpec.src, {
                    cwd: state.environment.path.concat(copySpec.cwd).join('/'),
                    nodir: true
                })
                    .then(function (matches) {
                        // Do the copy!
                        return Promise.all(matches.map(function (match) {
                            var fromPath = state.environment.path.concat(copySpec.cwd).concat([match]).join('/'),
                                toPath = state.environment.path.concat(copySpec.dest).concat([match]).join('/');
                            return fs.copy(fromPath, toPath, {});
                        }));
                    })
                    .then(function () {
                        return state;
                    });
            }));
        });
}

/*
 * Copy plugins from the bower module installation directory into the plugins
 * directory. We _could_ reference plugins directly from the bower directory,
 * as we do for other bower-installed dependencies, but it seems to be easier
 * to keep track of (and to be able to manipulate) plugins if they are all
 * located in a single, well-defined location.
 *
 * @returns {undefined}
 */
function installExternalPlugins(state) {
    // Load plugin config
    var root = state.environment.path,
        pluginConfig,
        pluginConfigFile = root.concat(['config', 'app', state.buildConfig.target, '/plugins.yml']).join('/');
    return Promise.all([fs.readFileAsync(pluginConfigFile, 'utf8')])
        .spread(function (pluginFile) {
            pluginConfig = yaml.safeLoad(pluginFile);
            return pluginConfig.plugins.filter(function (plugin) {
                return (typeof plugin === 'object' && plugin.internal !== true);
            });
        })
        .then(function (externalPlugins) {
            return [externalPlugins, Promise.all(externalPlugins.map(function (plugin) {
                if (plugin.source.bower) {
                    var cwds = plugin.cwd || 'dist/plugin',
                        cwd = cwds.split('/'),
                        srcDir = root.concat(['build', 'bower_components', plugin.globalName]).concat(cwd),
                        destDir = root.concat(['build', 'client', 'modules', 'plugins', plugin.name]);
                    return copyFiles(srcDir, destDir, '**/*');
                }
            }))];
        })
        .spread(function (externalPlugins) {
            return [externalPlugins, Promise.all(externalPlugins
                .filter(function (plugin) {
                    return plugin.source.directory ? true : false;
                })
                .map(function (plugin) {
                    var cwds = plugin.cwd || 'dist/plugin',
                        cwd = cwds.split('/'),
                        // Our actual cwd is mutations, so we need to escape one up to the
                        // project root.
                        repoRoot = (plugin.source.directory.root && plugin.source.directory.root.split('/')) || ['..', '..'],
                        source = repoRoot.concat([plugin.globalName]).concat(cwd),
                        destination = root.concat(['build', 'client', 'modules', 'plugins', plugin.name]);
                    return copyFiles(source, destination, '**/*');
                }))];
        })
        .spread(function (externalPlugins) {
            return Promise.all(externalPlugins
                .filter(function (plugin) {
                    return plugin.source.link ? true : false;
                })
                .map(function (plugin) {
                    var cwds = plugin.cwd || 'dist/plugin',
                        cwd = cwds.split('/'),
                        // Our actual cwd is mutations, so we need to escape one up to the
                        // project root.
                        repoRoot = (plugin.source.link.root && plugin.source.link.root.split('/')) || ['..', '..'],
                        source = repoRoot.concat([plugin.globalName]).concat(cwd),
                        destination = root.concat(['build', 'client', 'modules', 'plugins', plugin.name]);
                    return fs.mkdirAsync(destination.join('/'));
                }));
        });
}

// PROCESSES

/*
 * setupBuild
 *
 * Responsible for creating the basic build.
 *
 * The basic build may be deployed for development or distribution.
 *
 * The deployment process is separate and guided by the configuration input
 * into the overall build.
 *
 * The build setup is responsible for the initial juggling of files to represent
 * the rough state of the delivered system. Including
 *
 * - remove extraneous files
 * - move search into the client
 * - ??
 *
 * @param {type} state
 * @returns {Array}
 */
function setupBuild(state) {
    var root = state.environment.path;
    state.steps = [];
    return mutant.deleteMatchingFiles(state.environment.path.join('/'), /.*\.DS_Store$/)
        .then(function () {
            // the client really now becomes the build!
            var from = root.concat(['src', 'client']),
                to = root.concat(['build', 'client']);
            return fs.moveAsync(from.join('/'), to.join('/'));
        })
        .then(function () {
            // move search into client.
            var from = root.concat(['src', 'search']),
                to = root.concat(['build', 'client', 'search']);
            return fs.moveAsync(from.join('/'), to.join('/'));
        })
        .then(function () {
            return configureSearch(state);
        })
        .then(function () {
            return fs.moveAsync(root.concat(['bower.json']).join('/'), root.concat(['build', 'bower.json']).join('/'));
        })
        .then(function () {
            return fs.rmdirAsync(root.concat(['src']).join('/'));
        })
        .then(function () {
            return injectPluginsIntoBower(state);
        })
        .then(function () {
            return injectPluginsIntoConfig(state);
        })
        // .then(function () {
        //     return copyLocalModules(state);
        // })
        // .then(function () {
        //     return injectModulesIntoBower(state);
        // })
        .then(function () {
            return state;
        });
}

/**
 * Returns a Promise that sets the search config 'setup' to use the right target based on this build config.
 * Any errors are expected to be caught by the caller's catch().
 */
// TODO: refactor into deploy scripts
// we can no longer rely upon replacing the search config's "setup" property with the
// deployment id in order to invoke the right branch of the config.
// In reality, in prod and appdev devops must be replacing it by hand anyway, since it is the
// build phase which sets this.
// For now we keep doing this, which will work for dev and ci builds, but not for others, since the
// target is prod for next, prod, and appdev.

function configureSearch(state) {
    var configFile = state.environment.path.concat(['build', 'client', 'search', 'config.json']).join('/');
    return fs.readJson(configFile,
        function (err, config) {
            // Don't fix up the target any longer -- this needs to be done
            // at deploy time.
            // var target = state.config.targets.deploy;
            // config.setup = target;
            return fs.outputJson(configFile, config);
        }
    );
}

function fetchPackagesWithBower(state) {
    return bowerInstall(state)
        .then(function () {
            return fs.remove(state.environment.root.concat(['build', 'bower.json']).join('/'));
        })
        .then(function () {
            return state;
        });
}

function installBowerPackages(state) {
    return bowerInstall(state)
        .then(function () {
            return copyFromBower(state);
        })
        .then(function () {
            return state;
        });
}

function installPlugins(state) {
    return installExternalPlugins(state)
        .then(function () {
            return state;
        });
}

/*
 *
 * Copy the ui configuration files into the build.
 * settings.yml
 */
function copyUiConfig(state) {
    var root = state.environment.path,
        configSource = root.concat(['config', 'app', state.buildConfig.target]),
        releaseVersionConfig = root.concat(['config', 'release.yml']),
        configFiles = ['menus.yml', 'services.yml'].map(function (file) {
            return configSource.concat(file);
        }).concat([releaseVersionConfig]),
        configDest = root.concat(['build', 'client', 'modules', 'config']),
        baseUiConfig = root.concat('config', 'app', 'ui.yml');

    return mutant.loadYaml(baseUiConfig)
        .then(function (baseConfig) {
            return Promise.all(configFiles.map(function (file) {
                return mutant.loadYaml(file);
            }))
                .then(function (configs) {
                    return mergeObjects([baseConfig].concat(configs));
                })
                .then(function (mergedConfigs) {
                    state.mergedConfig = mergedConfigs;
                    return mutant.saveYaml(configDest.concat(['ui.yml']), mergedConfigs);
                });
        })
        .then(function () {
            return state;
        });
}

function createBuildInfo(state) {
    return gitinfo(state)
        .then(function (gitInfo) {
            // +++ 
            // state.config.targets.deploy = '{{ deploy.environment }}';
            var root = state.environment.path,
                configDest = root.concat(['build', 'client', 'modules', 'config', 'buildInfo.yml']),
                buildInfo = {
                    target: state.buildConfig.target,
                    stats: state.stats,
                    git: gitInfo,
                    // disabled for now, all uname packages are failing!
                    hostInfo: null,
                    builtAt: new Date().getTime(),
                };
            state.buildInfo = buildInfo;
            return mutant.saveYaml(configDest, { buildInfo: buildInfo })
                .then(function () {
                    return state;
                });
        });
}

function getReleaseNotes(state, version) {
    // lives in release-notes/RELEASE_NOTES_#.#.#.md
    var root = state.environment.path;
    var releaseNotesPath = root.concat(['release-notes', 'RELEASE_NOTES_' + version + '.md']);
    return fs.readFileAsync(releaseNotesPath.join('/'), 'utf8')
        .catch(function (err) {
            console.warn('release notes file not found: ' + releaseNotesPath.join('/'), err);
            return null;
        });
}

function verifyVersion(state) {
    return Promise.try(function () {
        console.log('Verifying version...');
        var releaseVersion = state.mergedConfig.release.version;
        var gitVersion = state.buildInfo.git.version;

        if (state.buildConfig.target === 'prod') {
            if (releaseVersion === gitVersion) {
                console.log('release and git agree on ' + releaseVersion);
            } else {
                throw new Error('Release and git versions are different; release says "' + releaseVersion + '", git says "' + gitVersion + '"');
            }
            return getReleaseNotes(state, releaseVersion)
                .then(function (releaseNotesFile) {
                    console.log('have release notes?', releaseNotesFile);
                });
        } else {
            // we have no assumptions. Well, either there is a release notes file and release.version in agreement,
            // or a new release notes is being worked on and is a higher version. Could check this...
            console.warn('In a dev build, release version not checked.');
        }
    })
        .then(function () {
            return state;
        });
}

function mergeObjects(listOfObjects) {
    var simpleObjectPrototype = Object.getPrototypeOf({});

    function isSimpleObject(obj) {
        return Object.getPrototypeOf(obj) === simpleObjectPrototype;
    }

    function merge(obj1, obj2, keyStack) {
        Object.keys(obj2).forEach(function (key) {
            var obj1Value = obj1[key];
            var obj2Value = obj2[key];
            var obj1Type = typeof obj1Value;
            var obj2Type = typeof obj2Value;
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

    var base = JSON.parse(JSON.stringify(listOfObjects[0]));
    for (var i = 1; i < listOfObjects.length; i += 1) {
        merge(base, listOfObjects[i], []);
    }
    return base;
}

// TODO: the deploy will be completely replaced with a deploy script.
// For now, the deploy is still required for dev and ci builds to work
// without the deploy script being integrated into the ci, next, appdev, and prod
// environments.
// TODO: those environments WILL need to be updated to support redeployment.
/*
  The kbase-ui deploy config is the only part of the config which changes between
  environments. (In reality the ui target does also determine what "type" of
  ui is built.)
  It provides the service url base, analytics keys, feature filters, ui elements.
*/
/*
 * obsolete:
 * The standard kbase deploy config lives in the root, and is named deploy.cfg
 * We pick one of the preconfigured deploy config files based on the deploy
 * target key passed in and found on state.config.targets.kbDeployConfig
 */
function makeKbConfig(state) {
    var root = state.environment.path,
        // fileName = state.buildConfig.target + '.yml',
        deployModules = root.concat(['build', 'client', 'modules', 'deploy']);

    return Promise.all([
        // mutant.loadYaml(root.concat(['config', 'deploy', fileName])),
        fs.mkdirsAsync(deployModules.join('/'))
    ])
        // .spread(function (deployConfig) {
        //     var dest = deployModules.concat(['config.json']);
        //     mutant.saveJson(dest, deployConfig);
        // })
        .then(function () {
            return fs.readFileAsync(root.concat(['config', 'deploy', 'templates', 'build-info.js.txt']).join('/'), 'utf8')
                .then(function (template) {
                    var dest = root.concat(['build', 'client', 'build-info.js']).join('/');
                    var out = handlebars.compile(template)(state.buildInfo);
                    return fs.writeFileAsync(dest, out);
                });
        })
        // Now merge the configs.
        .then(function () {
            var configs = [
                // root.concat('tmp', 'services.yml');
                root.concat(['config', 'services.yml']),
                root.concat(['build', 'client', 'modules', 'config', 'ui.yml']),
                root.concat(['build', 'client', 'modules', 'config', 'buildInfo.yml'])
            ];
            return Promise.all(configs.map(loadYaml))
                .then(function (yamls) {
                    var merged = mergeObjects(yamls);
                    // expand aliases for services
                    Object.keys(merged.services).forEach(function (serviceKey) {
                        var serviceConfig = merged.services[serviceKey];
                        var aliases = serviceConfig.aliases;
                        if (serviceConfig.aliases) {
                            delete serviceConfig.aliases;
                            aliases.forEach(function (alias) {
                                if (merged.services[alias]) {
                                    throw new Error('Service alias for ' + serviceKey + ' already in used: ' + alias);
                                }
                                merged.services[alias] = serviceConfig;
                            });
                        }
                    });
                    var dest = root.concat(['build', 'client', 'modules', 'config', 'config.json']);
                    return mutant.saveJson(dest, merged);
                })
                .then(function () {
                    return Promise.all(configs.map(function (file) {
                        fs.remove(file.join('/'));
                    }));
                });
        })
        // Rewrite the main entry point html files to add in cache-busting via the git commit hash
        .then(function () {
            Promise.all(['index.html', 'load-narrative.html'].map(function (fileName) {
                return Promise.all([fileName, fs.readFileAsync(root.concat(['build', 'client', fileName]).join('/'), 'utf8')]);
            }))
                .then(function (templates) {
                    return Promise.all(templates.map(function (template) {
                        var dest = root.concat(['build', 'client', template[0]]).join('/');
                        var out = handlebars.compile(template[1])(state);
                        return fs.writeFileAsync(dest, out);
                    }));
                });
        })
        .then(function () {
            return state;
        });
}

function makeDeployConfig(state) {
    var root = state.environment.path;
    var deployDir = root.concat(['build', 'deploy']);
    var cfgDir = root.concat(['build', 'deploy', 'cfg']);
    var sourceDir = root.concat(['config', 'deploy']);

    // make deploy dir
    return fs.mkdirsAsync(cfgDir.join('/'))
        .then(function () {
            // read yaml an write json deploy configs.
            return glob(sourceDir.concat(['*.yml']).join('/'), {
                nodir: true
            });
        })
        .then(function (matches) {
            return Promise.all(matches.map(function (match) {
                var baseName = path.basename(match);
                return mutant.loadYaml(match.split('/'))
                    .then(function (config) {
                        mutant.saveJson(cfgDir.concat([baseName + '.json']), config);
                    });

            }));
        })
        .then(function () {
            return state;
        });

    // save the deploy script
}

function cleanup(state) {
    var root = state.environment.path;
    return fs.removeAsync(root.concat(['build', 'bower_components']).join('/'))
        //.then(function () {
        //    return fs.removeAsync(root.concat(['build', 'bower.json']).join('/'));
        //})
        .then(function () {
            return fs.removeAsync(root.concat(['bower.json']).join('/'));
        })
        .then(function () {
            return fs.removeAsync(root.concat(['build', 'install', 'package.json']).join('/'));
        })
        .then(function () {
            return state;
        });
}

function makeBaseBuild(state) {
    var root = state.environment.path,
        buildPath = ['..', 'build'];

    return fs.removeAsync(buildPath.concat(['build']).join('/'))
        .then(function () {
            return fs.moveAsync(root.concat(['config']).join('/'), root.concat(['build', 'config']).join('/'));
        })
        .then(function () {
            return fs.moveAsync(root.concat(['install']).join('/'), root.concat(['build', 'install']).join('/'));
        })
        .then(function () {
            return fs.copyAsync(root.concat(['build']).join('/'), buildPath.concat(['build']).join('/'));
        })
        .then(function () {
            return state;
        });
}


function makeDistBuild(state) {
    var root = state.environment.path,
        buildPath = ['..', 'build'],
        uglify = require('uglify-js');

    return fs.copyAsync(root.concat(['build']).join('/'), root.concat(['dist']).join('/'))
        .then(function () {
            return glob(root.concat(['dist', 'client', 'modules', '**', '*.js']).join('/'), {
                nodir: true
            })
                .then(function (matches) {
                    // TODO: incorporate a sustainable method for omitting
                    // directories from alteration.
                    // FORNOW: we need to protect iframe-based plugins from having
                    // their plugin code altered.
                    var reProtected = /\/modules\/plugins\/.*?\/iframe_root\//;
                    return Promise.all(matches
                        .filter(function (match) {
                            return !reProtected.test(match);
                        })
                        .map(function (match) {
                            return fs.readFileAsync(match, 'utf8')
                                .then(function (contents) {
                                    var result = uglify.minify(contents, {
                                        output: {
                                            beautify: false,
                                            quote_style: 1
                                        }
                                    });
                                    if (result.error) {
                                        console.error('Error minifying file: ' + match, result);
                                        throw new Error('Error minifying file ' + match) + ':' + result.error;
                                    } else if (result.code.length === 0) {
                                        console.warn('Skipping empty file: ' + match);
                                    } else {
                                        return fs.writeFileAsync(match, result.code);
                                    }
                                });
                        }));
                });
        })
        .then(function () {
            // remove previously built dist.
            return fs.removeAsync(buildPath.concat(['dist']).join('/'));
        })
        .then(function () {
            // copy the new one there.
            return fs.copyAsync(root.concat(['dist']).join('/'), buildPath.concat(['dist']).join('/'));
        })
        .then(function () {
            return state;
        });
}

function makeModuleVFS(state, whichBuild) {
    var root = state.environment.path,
        buildPath = ['..', 'build'];

    return glob(root.concat([whichBuild, 'client', 'modules', '**', '*']).join('/'), {
        nodir: true,
        exclude: [
            [whichBuild, 'client', 'modules', 'deploy', 'config.json']
        ]
    })
        .then(function (matches) {

            // just read in file and build a giant map...
            var vfs = {
                scripts: {},
                resources: {
                    json: {},
                    text: {},
                    csv: {},
                    css: {}
                }
            };
            var vfsDest = buildPath.concat([whichBuild, 'client', 'moduleVfs.js']);
            var skipped = {};

            function skip(ext) {
                if (!skipped[ext]) {
                    skipped[ext] = 1;
                } else {
                    skipped[ext] += 1;
                }
            }
            var included = {};

            function include(ext) {
                if (!included[ext]) {
                    included[ext] = 1;
                } else {
                    included[ext] += 1;
                }
            }

            function showStats(db) {
                Object.keys(db).map(function (key) {
                    return {
                        key: key,
                        count: db[key]
                    };
                })
                    .sort(function (a, b) {
                        return b.count - a.count;
                    })
                    .forEach(function (item) {
                        console.log(item.key + ':' + item.count);
                    });
            }
            var exceptions = [
                /\/modules\/plugins\/.*?\/iframe_root\//
            ];
            var cssExceptions = [
                /@import/,
                /@font-face/
            ];
            // css in these libraries uses import. We _could_
            // var cssExceptions = [
            //     /main\.css$/,
            //     /^\/modules\/bower_components\/bootstrap\//,
            //     /^\/modules\/bower_components\/font-awesome\//,
            //     /^\/modules\/bower_components\/datatables\//,
            //     /^\/modules\/bower_components\/highlightjs\//
            // ];
            return Promise.all(matches
                .map(function (match) {
                    var relativePath = match.split('/').slice(root.length + 2);
                    return fs.readFileAsync(match, 'utf8')
                        .then(function (contents) {
                            // skip iframe_root directories, which are simply spliced
                            // into an iframe.
                            // if (relativePath.some(function (pathComponent) {
                            //         return (pathComponent === 'iframe_root');
                            //     })) {
                            //     // console.warn('skipping iframe_root: ' + relativePath.join('/'));
                            //     skipped += 1;
                            //     return;
                            // }
                            var path = '/' + relativePath.join('/');
                            if (exceptions.some(function (re) {
                                return (re.test(path));
                            })) {
                                skip('excluded');
                                return;
                            }
                            var m = /^(.*)\.([^.]+)$/.exec(path);
                            if (m) {
                                var base = m[1];
                                var ext = m[2];
                                // requirejs keeps the root forward slash.
                                switch (ext) {
                                case 'js':
                                    include(ext);
                                    vfs.scripts[path] = 'function () { ' + contents + ' }';
                                    break;
                                case 'yaml':
                                case 'yml':
                                    include(ext);
                                    vfs.resources.json[base] = yaml.safeLoad(contents);
                                    break;
                                case 'json':
                                    if (vfs.resources.json[base]) {
                                        throw new Error('duplicate entry for json detected: ' + path);
                                    }
                                    try {
                                        include(ext);
                                        vfs.resources.json[base] = JSON.parse(contents);
                                    } catch (ex) {
                                        skip('error');
                                        console.error('Error parsing json file: ' + path + ':' + ex.message);
                                        // throw new Error('Error parsing json file: ' + path + ':' + ex.message);
                                    }
                                    break;
                                case 'text':
                                case 'txt':
                                    include(ext);
                                    vfs.resources.text[base] = contents;
                                    break;
                                case 'css':
                                    if (cssExceptions.some(function (re) {
                                        return re.test(contents);
                                    })) {
                                        skip('css excluded');
                                    } else {
                                        // console.log('css included', base);
                                        include(ext);
                                        vfs.resources.css[base] = contents;
                                    }
                                    break;
                                case 'csv':
                                    // console.warn('csv not handled yet: ' + path);
                                    skip(ext);
                                    break;
                                default:
                                    skip(ext);
                                        // console.warn('File type "' + ext + '" not supported: ' + path);
                                        // break;
                                }
                            } else {
                                skip('no extension');
                                console.warn('module vfs cannot include file without extension: ' + path);
                            }
                        });
                }))
                .then(function () {
                    // var script = 'window.require_modules = ' + JSON.stringify(vfs, null, 4);
                    console.log('vfs created');
                    console.log('skipped: ');
                    showStats(skipped);
                    console.log('included:');
                    showStats(included);
                    var modules = '{' + Object.keys(vfs.scripts).map(function (path) {
                        return '"' + path + '": ' + vfs.scripts[path];
                    }).join(', \n') + '}';
                    var script = [
                        'window.require_modules = ' + modules,
                        'window.require_resources = ' + JSON.stringify(vfs.resources, null, 4)
                    ].join(';\n');

                    fs.writeFileAsync(vfsDest.join('/'), script);
                });
        })
        .then(function () {
            return state;
        });
}

// STATE
// initial state
/*
 * filesystem: an initial set files files
 */

function main(type) {
    // INPUT
    var initialFilesystem = [{
        cwd: ['..'],
        path: ['src']
    }, {
        cwd: ['..'],
        files: ['bower.json']
    }, {
        cwd: ['..'],
        path: ['install']
    }, {
        cwd: ['..'],
        path: ['release-notes']
    }];
    // Use a copy of the configs in the dev directory; this supports local hacking without worry
    // of accidentally checking in temporary config changes.
    return pathExists('../dev/config')
        .then(function (exists) {
            // ugly work around for now
            var buildControlConfigPath;
            if (exists) {
                initialFilesystem.push({
                    cwd: ['..', 'dev'],
                    path: ['config']
                });
                buildControlConfigPath = ['..', 'dev', 'config', 'builds', type + '.yml'];
            } else {
                initialFilesystem.push({
                    cwd: ['..'],
                    path: ['config']
                });
                buildControlConfigPath = ['..', 'config', 'builds', type + '.yml'];
            }
            return {
                initialFilesystem: initialFilesystem,
                buildControlConfigPath: buildControlConfigPath
            };
        })
        .then(function (config) {
            console.log('Creating initial state with config: ');
            return mutant.createInitialState(config);
        })
        .then(function (state) {
            return mutant.copyState(state);
        })
        .then(function (state) {
            console.log('Setting up build...');
            return setupBuild(state);
        })

    // .then(function (state) {
    //     return mutant.copyState(state);
    // })
    // .then(function (state) {
    //     return makeBuildInfo(state);
    // })

        .then(function (state) {
            return mutant.copyState(state);
        })
        .then(function (state) {
            console.log('Fetching bower packages...');
            return fetchPackagesWithBower(state);
        })

        .then(function (state) {
            return mutant.copyState(state);
        })
        .then(function (state) {
            console.log('Installing bower packages...');
            return installBowerPackages(state);
        })

        .then(function (state) {
            return mutant.copyState(state);
        })
        .then(function (state) {
            console.log('Installing Plugins...');
            return installPlugins(state);
        })


    // .then(function (state) {
    //         return mutant.copyState(state);
    //     })
    //     .then(function (state) {
    //         console.log('Installing Modules...');
    //         return installModules(state);
    //     })

        .then(function (state) {
            return mutant.copyState(state);
        })
        .then(function (state) {
            console.log('Installing Module Packages from Bower...');
            return installModulePackagesFromBower(state);
        })

    //        .then(function (state) {
    //            return mutant.copyState(state);
    //        })
    //        .then(function (state) {
    //            return installModulePackagesFromFilesystem(state);
    //        })

        .then(function (state) {
            return mutant.copyState(state);
        })
        .then(function (state) {
            console.log('Copying config files...');
            return copyUiConfig(state);
        })

        .then(function (state) {
            return mutant.copyState(state);
        })
        .then(function (state) {
            console.log('Creating build record ...');
            return createBuildInfo(state);
        })

    // Here we verify that the verion stamp, release notes, and tag are consistent.
    // For prod we need to compare all three and fail the build if there is not a match.
    // For dev, we need to compare the stamp and release notes, not the tag.
    // At some future time when working solely off of master, we will be able to compare
    // to the most recent tag.
        .then(function (state) {
            return mutant.copyState(state);
        })
        .then(function (state) {
            console.log('Verifying version...');
            return verifyVersion(state);
        })

        .then(function (state) {
            return mutant.copyState(state);
        })
        .then(function (state) {
            console.log('Making KBase Config...');
            return makeKbConfig(state);
        })

        .then(function (state) {
            return mutant.copyState(state);
        })
        .then(function (state) {
            console.log('Making deploy configs');
            return makeDeployConfig(state);
        })

    // Disable temporarily ... we don't want to wipe out bower.json
    // until we have determined if we will be building a dist.
        .then(function (state) {
            return mutant.copyState(state);
        })
        .then(function (state) {
            console.log('Cleaning up...');
            return cleanup(state);
        })




    // From here, we can make a dev build, make a release
        .then(function (state) {
            return mutant.copyState(state);
        })
        .then(function (state) {
            console.log('Making the base build...');
            return makeBaseBuild(state);
        })

        .then(function (state) {
            return mutant.copyState(state);
        })
        .then(function (state) {
            if (state.buildConfig.dist) {
                console.log('Making the dist build...');
                return makeDistBuild(state);
            }
            return state;
        })

        .then(function (state) {
            return mutant.copyState(state);
        })
        .then(function (state) {
            // var vfs = [makeModuleVFS(state, 'build')];
            // TODO: a build flag for the vfs.
            // FORNOW: no vfs build for dev
            var vfs = [];
            // vfs.push(makeModuleVFS(state, 'build'));
            if (state.buildConfig.vfs && state.buildConfig.dist) {
                vfs.push(makeModuleVFS(state, 'dist'));
            }
            return Promise.all(vfs)
                .then(function () {
                    return state;
                });
        })

    // Here we handle any developer links.
    //.then(function (state) {
    //    return mutant.copyState(state);
    //})
    //.then(function (state) {
    //
    //})

        .then(function (state) {
            return mutant.finish(state);
        })
        .catch(function (err) {
            console.error('ERROR');
            console.error(err);
            console.error(util.inspect(err, {
                showHidden: false,
                depth: 10
            }));
            console.error(err.message);
            console.error(err.name);
            console.error(err.stack);
        });
}

function usage() {
    console.error('usage: node build <config>');
}

var type = process.argv[2];

if (type === undefined) {
    console.error('Build config not specified');
    usage();
    process.exit(1);
}

main(type);
