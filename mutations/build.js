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
    pathExists = require('path-exists'),
    findit = require('findit2'),
    mutant = require('./mutant'),
    yaml = require('js-yaml'),
    bower = require('bower'),
    glob = Promise.promisify(require('glob').Glob),
    ini = require('ini'),
    underscore = require('underscore'),
    dir = Promise.promisifyAll(require('node-dir'));


// UTILS

function copyFiles(from, to, globExpr) {
    return glob(globExpr, {
        cwd: from.join('/')
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
    var yamlPath = yamlPath.join('/');
    return fs.readFileAsync(yamlPath, 'utf8')
        .then(function (contents) {
            return yaml.safeLoad(contents);
        });
}

function loadIni(iniPath) {
    var yamlPath = iniPath.join('/');
    return fs.readFileAsync(yamlPath, 'utf8')
        .then(function (contents) {
            return ini.parse(contents);
        });
}

function saveIni(path, iniData) {
    return fs.writeFileAsync(path.join('/'), ini.stringify(iniData));
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
 * Copy files from one directory to another, creating any required directories.
 */
function copyDirFiles(from, to) {
    var fromPath, toPath;
    return fs.realpathAsync(from)
        .then(function (realpath) {
            fromPath = realpath.split('/');
            return fs.realpathAsync(to);
        })
        .then(function (realpath) {
            toPath = realpath.split('/');
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

/*
 * Simply copies directory trees into the top level of the modules client directory
 *
 */
function copyModules(state) {
    var root = state.environment.path,
        configFilePath = root.concat(['config', 'ui', state.config.targets.ui, 'build.yml']).join('/');
    return fs.readFileAsync(configFilePath, 'utf8')
        .then(function (configFile) {
            return yaml.safeLoad(configFile);
        })
        .then(function (config) {
            return Promise.all(config.modules.filter(function (spec) {
                if (spec.copy) {
                    return true;
                }
                return false;
            }).map(function (spec) {
                return copyDirFiles(spec.copy.from, root.concat(['build', 'client', 'modules']).join('/'));
                // return fs.copyAsync(spec.copy.from, root.concat(['build', 'client', 'modules']).join('/'));
            }));
        });
}

function copyModulesx(state) {
    var root = state.environment.path,
        configFilePath = root.concat(['config', 'ui', state.config.targets.ui, 'build.yml']).join('/');
    return fs.readFileAsync(configFilePath, 'utf8')
        .then(function (configFile) {
            return yaml.safeLoad(configFile);
        })
        .then(function (config) {
            return Promise.all(config.modules.filter(function (spec) {
                if (spec.copy) {
                    return true;
                }
                return false;
            }).map(function (spec) {
                return fs.copyAsync(spec.copy.from, root.concat(['build', 'client', 'modules']).join('/'));
            }));
        });
}
function injectModulesIntoBower(state) {
    // Load plugin config        
    var root = state.environment.path,
        pluginConfig, pluginConfigFile = root.concat(['config', 'ui', state.config.targets.ui, 'build.yml']).join('/'),
        bowerConfig, bowerConfigFile = root.concat(['build', 'bower.json']).join('/');
    return Promise.all([fs.readFileAsync(pluginConfigFile, 'utf8'), fs.readFileAsync(bowerConfigFile, 'utf8')])
        .spread(function (pluginFile, bowerFile) {
            pluginConfig = yaml.safeLoad(pluginFile);
            bowerConfig = JSON.parse(bowerFile);
        })
        .then(function () {
            // First ensure all plugin packages are installed via bower.
            pluginConfig.modules
                .filter(function (module) {
                    if (typeof module === 'object' && module.bower) {
                        return true;
                    }
                    return false;
                })
                .forEach(function (plugin) {
                    bowerConfig.dependencies[plugin.bower.name || plugin.name] = plugin.bower.version;
                });

            return fs.writeFileAsync(root.concat(['build', 'bower.json']).join('/'), JSON.stringify(bowerConfig, null, 4));
        });
}

function injectPluginsIntoBower(state) {
    // Load plugin config        
    var root = state.environment.path,
        pluginConfig, pluginConfigFile = root.concat(['config', 'ui', state.config.targets.ui, 'build.yml']).join('/'),
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
                    if (typeof plugin === 'object' && plugin.bower) {
                        return true;
                    }
                    return false;
                })
                .forEach(function (plugin) {
                    bowerConfig.dependencies[plugin.bower.name] = plugin.bower.version;
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
        pluginConfigFile = root.concat(['config', 'ui', state.config.targets.ui, 'build.yml']).join('/');

    return fs.ensureDirAsync(configPath.join('/'))
        .then(function () {
            return fs.readFileAsync(pluginConfigFile, 'utf8');
        })
        .then(function (pluginFile) {
            return yaml.safeLoad(pluginFile);
        })
        .then(function (pluginConfig) {
            var newConfig = pluginConfig.plugins.map(function (pluginItem) {
                if (typeof pluginItem === 'string') {
                    return pluginItem;
                }
                return pluginItem.name;
            });

            // emulate the yaml file for now, or for ever.
            return fs.writeFileAsync(configPath.concat(['plugin.yml']).join('/'),
                yaml.safeDump({plugins: newConfig}));
        });
}

function bowerInstall(state) {
    return new Promise(function (resolve, reject) {
        var base = state.environment.path.concat(['build']).join('/');
        bower.commands
            .install(undefined, undefined, {
                cwd: base,
                offline: state.config.bower.offline || false,
                // registry: "http://localhost:5678",
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
                var dir = cfg.dir || cfg.name, sources, cwd, dest;
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
                 the destination. Since we are relative to the root of this proces, we
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
                    dest = ['build', 'client', 'modules'];
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
                    cwd: state.environment.path.concat(copySpec.cwd).join('/')
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
        pluginConfigFile = root.concat(['config', 'ui', state.config.targets.ui, '/build.yml']).join('/');
    return Promise.all([fs.readFileAsync(pluginConfigFile, 'utf8')])
        .spread(function (pluginFile) {
            pluginConfig = yaml.safeLoad(pluginFile);
            return pluginConfig.plugins.filter(function (plugin) {
                if (typeof plugin !== 'string') {
                    return plugin;
                }
            });
        })
        .then(function (externalPlugins) {
            return [externalPlugins, Promise.all(externalPlugins.map(function (plugin) {
                    if (plugin.bower) {
                        var cwds = plugin.copy.path || 'dist/plugin',
                            cwd = cwds.split('/'),
                            srcDir = root.concat(['build', 'bower_components', plugin.bower.name]).concat(cwd),
                            destDir = root.concat(['build', 'client', 'modules', 'plugins', plugin.name]);
                        return copyFiles(srcDir, destDir, '**/*');
                    }
                }))];
        })
        .spread(function (externalPlugins) {
            return Promise.all(externalPlugins
                .filter(function (plugin) {
                    return plugin.link ? true : false;
                })
                .map(function (plugin) {
                    if (plugin.link) {
                        var cwds = plugin.copy.path || 'dist/plugin',
                            cwd = cwds.split('/'),
                            // Our actual cwd is mutations, so we need to escape one up to the 
                            // project root.
                            source = ['..'].concat(plugin.link.source.split('/')).concat(cwd),
                            destination = root.concat(['build', 'client', 'modules', 'plugins', plugin.name]);
                        return copyFiles(source, destination, '**/*');
                    }
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
        .then(function () {
            return copyModules(state);
        })
        .then(function () {
            return injectModulesIntoBower(state);
        })
        .then(function () {
            return state;
        });
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
        configSource = root.concat(['config', 'ui', state.config.targets.ui]),
        configDest = root.concat(['build', 'client', 'modules', 'config']),
        configFiles = ['settings.yml'];

    return Promise.all(configFiles.map(function (file) {
        return mutant.copyFiles(configSource, configDest, file);
    }))
        .then(function () {
            return state;
        });
}

/*
 * 
 * The standard kbase deploy config lives in the root, and is named deploy.cfg
 * We pick one of the preconfigured deploy config files based on the deploy
 * target key passed in and found on state.config.targets.kbDeployConfig
 */
function makeKbConfig(state) {
    var root = state.environment.path,
        fileName = 'deploy-' + state.config.targets.kbDeployKey + '.cfg';

    return Promise.all([
        loadIni(root.concat(['config', 'deploy', fileName])),
        fs.readFileAsync(root.concat(['config', 'deploy', 'templates', 'service.yml']).join('/'), 'utf8')
    ])
        .spread(function (kbDeployConfig, template) {
            state.config.kbDeployConfig = kbDeployConfig;
            var compiled = underscore.template(template),
                expanded = compiled(kbDeployConfig['kbase-ui']);
            return Promise.all([expanded, saveIni(root.concat(['deploy.cfg']), kbDeployConfig)]);
        })
        .spread(function (configContents) {
            var dest = root.concat(['build', 'client', 'modules', 'config', 'service.yml']).join('/');
            return fs.writeFileAsync(dest, configContents);
        })
        .then(function () {
            return state;
        });
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

function makeDevBuild(state) {
    var root = state.environment.path,
        devPath = ['..', 'dev'],
        buildPath = ['..', 'build'];

    return fs.removeAsync(buildPath.concat(['build']).join('/'))
        .then(function () {
            return fs.ensureDirAsync(devPath.join('/'));
        })
        .then(function () {
            return fs.moveAsync(root.concat(['deploy.cfg']).join('/'), root.concat(['build', 'deploy.cfg']).join('/'));
        })
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
            glob(root.concat(['dist', 'client', 'modules', '**', '*.js']).join('/'))
                .then(function (matches) {
                    return Promise.all(matches.map(function (match) {
                        var result = uglify.minify(match);
                        return fs.writeFileAsync(match, result.code);
                    }));
                });
        })
        .then(function () {
            return fs.removeAsync(buildPath.concat(['dist']).join('/'));
        })
        .then(function () {
            return fs.copyAsync(root.concat(['dist']).join('/'), buildPath.concat(['dist']).join('/'));
        });
}


// STATE
// initial state
/*
 * filesystem: an initial set files files
 */



function main() {
// INPUT
    var initialFilesystem = [
        {
            cwd: ['..'],
            path: ['src']
        },
        {
            cwd: ['..'],
            files: ['deploy.cfg', 'bower.json']
        },
        {
            cwd: ['..'],
            path: ['install']
        }
    ];
    return pathExists('../dev/config')
        .then(function (exists) {
            // ugly work around for now
            var buildControlConfigPath;
            if (exists) {
                initialFilesystem.push({
                    cwd: ['..', 'dev'],
                    path: ['config']
                });
                buildControlConfigPath = ['..', 'dev', 'config', 'build.yml'];
            } else {
                initialFilesystem.push({
                    cwd: ['..'],
                    path: ['config']
                });
                buildControlConfigPath = ['..', 'config', 'build.yml'];
            }
            return {
                initialFilesystem: initialFilesystem,
                buildControlConfigPath: buildControlConfigPath
            };
        })
        .then(function (config) {
            console.log('Creating initial state with config: ');
            console.log(config);
            return mutant.createInitialState(config);
        })
        .then(function (state) {
            return mutant.copyState(state);
        })
        .then(function (state) {
            console.log('Setting up build...');
            return setupBuild(state);
        })

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
            console.log('Making KBase Config...');
            return makeKbConfig(state);
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
            console.log('Making the dev build...');
            return makeDevBuild(state);
        })

        .then(function (state) {
            return mutant.copyState(state);
        })
        .then(function (state) {
            if (state.config.build.dist) {
                console.log('Making the dist build...');
                return makeDistBuild(state);
            } else {
                return null;
            }
        })
        .catch(function (err) {
            console.log('ERROR');
            console.log(err);
            console.log(err.stack);
        });
}

main();
