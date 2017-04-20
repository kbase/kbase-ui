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
    dir = Promise.promisifyAll(require('node-dir')),
    util = require('util'),
    git = require('git-repo-info'),
    // disabled - uname package fails to install
    // uname = require('uname'),
    handlebars = require('handlebars');

// UTILS

function copyFiles(from, to, globExpr) {
    return glob(globExpr, {
            cwd: from.join('/')
        })
        .then(function(matches) {
            return Promise.all(matches.map(function(match) {
                var fromPath = from.concat([match]).join('/'),
                    toPath = to.concat([match]).join('/');
                return fs.copy(fromPath, toPath, {});
            }));
        });
}

function loadYaml(yamlPath) {
    var yamlPath = yamlPath.join('/');
    return fs.readFileAsync(yamlPath, 'utf8')
        .then(function(contents) {
            return yaml.safeLoad(contents);
        });
}

function loadIni(iniPath) {
    var yamlPath = iniPath.join('/');
    return fs.readFileAsync(yamlPath, 'utf8')
        .then(function(contents) {
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
 * Copy files from one directory to another, creating any required directories,
 * but of course requiring the source to exist.
 */
function copyDirFiles(pathFrom, pathTo) {
    var from = pathFrom.join('/'),
        to = pathTo.join('/'),
        fromPath, toPath = pathTo;
    return fs.realpathAsync(from)
        .then(function(realpath) {
            fromPath = realpath.split('/');
            return dir.filesAsync(from);
        })
        .then(function(paths) {
            return Promise.all(paths.map(function(path) {
                return fs.realpathAsync(path)
                    .then(function(realpath) {
                        return realpath.split('/');
                    });
            }));
        })
        .then(function(realpaths) {
            return Promise.all(realpaths.map(function(filePath) {
                var dir = filePath.slice(0, filePath.length - 1),
                    relative = arrayDiff(fromPath, dir),
                    fileName = filePath[filePath.length - 1],
                    targetDir = toPath.concat(relative);
                // make the found paths relative.

                return fs.ensureDirAsync(targetDir.join('/'))
                    .then(function() {
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
function copyLocalModules(state) {
    var root = state.environment.path,
        projectRoot = root.concat(['..', '..', '..']),
        configFilePath = root.concat(['config', 'ui', state.config.targets.ui, 'build.yml']).join('/');
    return fs.readFileAsync(configFilePath, 'utf8')
        .then(function(configFile) {
            return yaml.safeLoad(configFile);
        })
        .then(function(config) {
            return Promise.all(config.modules.filter(function(spec) {
                if (spec.directory) {
                    return true;
                }
                return false;
            }).map(function(spec) {
                var from = projectRoot.concat(spec.directory.path.split('/')),
                    to = root.concat(['build', 'local_modules']);

                return copyDirFiles(from, to);
            }));
        });
}

function dirList(dir) {
    return fs.readdirAsync(dir.join('/'))
        .then(function(files) {
            return files.map(function(file) {
                return dir.concat([file]);
            });
        })
        .then(function(files) {
            return Promise.all(files.map(function(file) {
                return fs.statAsync(file.join('/')).then(function(stats) {
                    return {
                        stats: stats,
                        path: file
                    };
                });
            }));
        })
        .then(function(files) {
            return files.filter(function(file) {
                return file.stats.isDirectory();
            });
        });
}

/*
 * Install any bower package which has an install config file at the top level.
 */

function installModule(state, source) {
    return loadYaml(source.concat(['install.yml']))
        .then(function(installConfig) {
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
        .then(function(dirs) {
            return Promise.all(dirs.map(function(dir) {
                return Promise.all([dir, pathExists(dir.path.concat('install.yml').join('/'))]);
            }));
        })
        .then(function(dirs) {
            return dirs
                .filter(function(dir) {
                    return dir[1];
                })
                .map(function(dir) {
                    return dir[0];
                });
        })
        .then(function(installDirs) {
            return Promise.all(installDirs.map(function(installDir) {
                // console.log('Installing module: ' + installDir.path);
                return installModule(state, installDir.path);
            }));
        })
        .then(function() {
            return state;
        });
}

function installModulePackagesFromFilesystem(state) {
    // iterate through all of the bower packages in root/bower_components
    var root = state.environment.path;

    return dirList(root.concat(['build', 'bower_components']))
        .then(function(dirs) {
            return Promise.all(dirs.map(function(dir) {
                return Promise.all([dir, pathExists(dir.path.concat('install.yml').join('/'))]);
            }));
        })
        .then(function(dirs) {
            return dirs
                .filter(function(dir) {
                    return dir[1];
                })
                .map(function(dir) {
                    return dir[0];
                });
        })
        .then(function(installDirs) {
            return Promise.all(installDirs.map(function(installDir) {
                return installModule(state, installDir.path);
            }));
        })
        .then(function() {
            return state;
        });
}

function injectModulesIntoBower(state) {
    // Load plugin config        
    var root = state.environment.path,
        pluginConfig, pluginConfigFile = root.concat(['config', 'ui', state.config.targets.ui, 'build.yml']).join('/'),
        bowerConfig, bowerConfigFile = root.concat(['build', 'bower.json']).join('/');
    return Promise.all([fs.readFileAsync(pluginConfigFile, 'utf8'), fs.readFileAsync(bowerConfigFile, 'utf8')])
        .spread(function(pluginFile, bowerFile) {
            pluginConfig = yaml.safeLoad(pluginFile);
            bowerConfig = JSON.parse(bowerFile);
        })
        .then(function() {
            // First ensure all plugin packages are installed via bower.
            pluginConfig.modules
                .filter(function(module) {
                    if (typeof module === 'object' && module.source.bower) {
                        return true;
                    }
                    return false;
                })
                .forEach(function(module) {
                    var name = module.source.bower.name || module.globalName,
                        version = module.source.bower.version || module.version;
                    bowerConfig.dependencies[name] = version;
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
        .spread(function(pluginFile, bowerFile) {
            pluginConfig = yaml.safeLoad(pluginFile);
            bowerConfig = JSON.parse(bowerFile);
        })
        .then(function() {
            // First ensure all plugin packages are installed via bower.
            pluginConfig.plugins
                .filter(function(plugin) {
                    if (typeof plugin === 'object' && plugin.source.bower) {
                        return true;
                    }
                    return false;
                })
                .forEach(function(plugin) {
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
        pluginConfigFile = root.concat(['config', 'ui', state.config.targets.ui, 'build.yml']).join('/');

    return fs.ensureDirAsync(configPath.join('/'))
        .then(function() {
            return fs.readFileAsync(pluginConfigFile, 'utf8');
        })
        .then(function(pluginFile) {
            return yaml.safeLoad(pluginFile);
        })
        .then(function(pluginConfig) {
            var newConfig = pluginConfig.plugins.map(function(pluginItem) {
                if (typeof pluginItem === 'string') {
                    return pluginItem;
                }
                return pluginItem.name;
            });

            // emulate the yaml file for now, or for ever.
            return fs.writeFileAsync(configPath.concat(['plugin.yml']).join('/'),
                yaml.safeDump({ plugins: newConfig }));
        });
}

function bowerInstall(state) {
    return new Promise(function(resolve, reject) {
        var base = state.environment.path.concat(['build']).join('/');
        bower.commands
            .install(undefined, undefined, {
                cwd: base,
                offline: state.config.bower.offline || false,
                // registry: "http://localhost:5678",
                timeout: 300000
            })
            .on('end', function(installed) {
                resolve(installed);
            })
            .on('error', function(err) {
                reject(err);
            });
    });
}

function copyFromBower(state) {
    var root = state.environment.path;

    return mutant.loadYaml(root.concat(['config', 'bowerInstall.yml']))
        .then(function(config) {
            var copyJobs = [];

            config.bowerFiles.forEach(function(cfg) {
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

                sources.forEach(function(source) {
                    copyJobs.push({
                        cwd: cwd,
                        src: source,
                        dest: dest
                    });
                });
            });

            // Create and execute a set of promises to fetch and operate on the files found
            // in the above spec.
            return Promise.all(copyJobs.map(function(copySpec) {
                return glob(copySpec.src, {
                        cwd: state.environment.path.concat(copySpec.cwd).join('/')
                    })
                    .then(function(matches) {
                        // Do the copy!
                        return Promise.all(matches.map(function(match) {
                            var fromPath = state.environment.path.concat(copySpec.cwd).concat([match]).join('/'),
                                toPath = state.environment.path.concat(copySpec.dest).concat([match]).join('/');
                            return fs.copy(fromPath, toPath, {});
                        }));
                    })
                    .then(function() {
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
        .spread(function(pluginFile) {
            pluginConfig = yaml.safeLoad(pluginFile);
            return pluginConfig.plugins.filter(function(plugin) {
                if (typeof plugin !== 'string') {
                    return plugin;
                }
            });
        })
        .then(function(externalPlugins) {
            return [externalPlugins, Promise.all(externalPlugins.map(function(plugin) {
                if (plugin.source.bower) {
                    var cwds = plugin.cwd || 'dist/plugin',
                        cwd = cwds.split('/'),
                        srcDir = root.concat(['build', 'bower_components', plugin.globalName]).concat(cwd),
                        destDir = root.concat(['build', 'client', 'modules', 'plugins', plugin.name]);
                    return copyFiles(srcDir, destDir, '**/*');
                }
            }))];
        })
        .spread(function(externalPlugins) {
            return [externalPlugins, Promise.all(externalPlugins
                .filter(function(plugin) {
                    return plugin.source.directory ? true : false;
                })
                .map(function(plugin) {
                    var cwds = plugin.cwd || 'dist/plugin',
                        cwd = cwds.split('/'),
                        // Our actual cwd is mutations, so we need to escape one up to the 
                        // project root.
                        repoRoot = (plugin.source.directory.root && plugin.source.directory.root.split('/')) || ['..', '..'],
                        source = repoRoot.concat([plugin.globalName]).concat(cwd),
                        destination = root.concat(['build', 'client', 'modules', 'plugins', plugin.name]);
                    //                    console.log('EXTERNAL plugin');
                    //                    console.log(source);
                    //                    console.log(destination);

                    return copyFiles(source, destination, '**/*');
                }))];
        })
        .spread(function(externalPlugins) {
            return Promise.all(externalPlugins
                .filter(function(plugin) {
                    return plugin.source.link ? true : false;
                })
                .map(function(plugin) {
                    var cwds = plugin.cwd || 'dist/plugin',
                        cwd = cwds.split('/'),
                        // Our actual cwd is mutations, so we need to escape one up to the 
                        // project root.
                        repoRoot = (plugin.source.link.root && plugin.source.link.root.split('/')) || ['..', '..'],
                        source = repoRoot.concat([plugin.globalName]).concat(cwd),
                        destination = root.concat(['build', 'client', 'modules', 'plugins', plugin.name]);
                    //                    console.log('EXTERNAL plugin');
                    //                    console.log(source);
                    //                    console.log(destination);

                    return fs.mkdirAsync(destination.join('/'));
                    // return linkDirectories(destination, source);
                    // +++ 
                    // return copyFiles(source, destination, '**/*');
                }));
        });
}

function linkDirectories(source, destination) {
    return fs.symlinkAsync(source.join('/'), destination.join('/'));
}

/*
 * Simply copies any modules which have a directory source into the bower components tree.
 * Messy, but necessary for development.
 */

function installModules(state) {
    return installExternalModules(state)
        .then(function() {
            return state;
        });
}

function installExternalModules(state) {
    // Load plugin config
    var root = state.environment.path,
        buildConfig,
        buildConfigFile = root.concat(['config', 'ui', state.config.targets.ui, '/build.yml']).join('/');
    return fs.readFileAsync(buildConfigFile, 'utf8')
        .then(function(contents) {
            buildConfig = yaml.safeLoad(contents);
            return buildConfig.modules.filter(function(module) {
                if (module.source.directory) {
                    return true;
                }
                return false;
            });
        })
        .then(function(modules) {
            return Promise.all(modules.map(function(module) {
                var repoRoot = (module.source.directory.root && module.source.directory.root.split('/')) || ['..', '..'],
                    source = repoRoot.concat([module.globalName]),
                    destination = root.concat(['build', 'client', 'modules', 'bower_components', module.globalName]);
                console.log('copying from...');
                console.log(repoRoot);
                console.log(source), console.log(destination);
                return copyFiles(source, destination, '**/*');
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
        .then(function() {
            // the client really now becomes the build!
            var from = root.concat(['src', 'client']),
                to = root.concat(['build', 'client']);
            return fs.moveAsync(from.join('/'), to.join('/'));
        })
        .then(function() {
            // move search into client.
            var from = root.concat(['src', 'search']),
                to = root.concat(['build', 'client', 'search']);
            return fs.moveAsync(from.join('/'), to.join('/'));
        })
        .then(function() {
            return configureSearch(state);
        })
        .then(function() {
            return fs.moveAsync(root.concat(['bower.json']).join('/'), root.concat(['build', 'bower.json']).join('/'));
        })
        .then(function() {
            return fs.rmdirAsync(root.concat(['src']).join('/'));
        })
        .then(function() {
            return injectPluginsIntoBower(state);
        })
        .then(function() {
            return injectPluginsIntoConfig(state);
        })
        .then(function() {
            return copyLocalModules(state);
        })
        .then(function() {
            return injectModulesIntoBower(state);
        })
        .then(function() {
            return state;
        });
}

/**
 * Returns a Promise that sets the search config 'setup' to use the right target based on this build config.
 * Any errors are expected to be caught by the caller's catch().
 */
function configureSearch(state) {
    var configFile = state.environment.path.concat(['build', 'client', 'search', 'config.json']).join('/');
    return fs.readJson(configFile,
        function(err, config) {
            var target = state.config.targets.deploy;
            config.setup = target;
            return fs.outputJson(configFile, config);
        }
    );
}

function fetchPackagesWithBower(state) {
    return bowerInstall(state)
        .then(function() {
            return fs.remove(state.environment.root.concat(['build', 'bower.json']).join('/'));
        })
        .then(function() {
            return state;
        });
}

function installBowerPackages(state) {
    return bowerInstall(state)
        .then(function() {
            return copyFromBower(state);
        })
        .then(function() {
            return state;
        });
}

function installPlugins(state) {
    return installExternalPlugins(state)
        .then(function() {
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

    return Promise.all(configFiles.map(function(file) {
            return mutant.copyFiles(configSource, configDest, file);
        }))
        .then(function() {
            return state;
        });
}

function createBuildInfo(state) {
    var root = state.environment.path,
        configDest = root.concat(['build', 'client', 'modules', 'config', 'buildInfo.json']),
        buildInfo = {
            features: state.config.features,
            targets: state.config.targets,
            stats: state.stats,
            git: git(),
            // disabled for now, all uname packages are failing!
            hostInfo: null,
            builtAt: new Date().getTime(),
        };
    state.buildInfo = buildInfo;
    // console.log('info', buildInfo, state);
    return mutant.saveJson(configDest, buildInfo)
        .then(function() {
            return state;
        });
}

// function makeBuildInfo(state) {
//     return Promise.try(function () {
//         state.buildInfo = {
//             deployType: 'dev',
//             git: git(),
//             hostInfo: uname(),
//             builtAt: new Date().getTime(),
//             // buildHost: 'Darwin Eriks-MacBook-Pro.local 16.5.0 Darwin Kernel Version 16.5.0: Fri Mar  3 16:45:33 PST 2017; root:xnu-3789.51.2~1/RELEASE_X86_64 x86_64'
//         }

//     return state;
//     });
// }

/*
 * 
 * The standard kbase deploy config lives in the root, and is named deploy.cfg
 * We pick one of the preconfigured deploy config files based on the deploy
 * target key passed in and found on state.config.targets.kbDeployConfig
 */
function makeKbConfig(state) {
    var root = state.environment.path,
        fileName = 'deploy-' + state.config.targets.deploy + '.cfg';

    return Promise.all([
            loadIni(root.concat(['config', 'deploy', fileName])),
            fs.readFileAsync(root.concat(['config', 'deploy', 'templates', 'service.yml']).join('/'), 'utf8')
        ])
        .spread(function(kbDeployConfig, template) {
            state.config.kbDeployConfig = kbDeployConfig;
            var compiled = underscore.template(template),
                expanded = compiled(kbDeployConfig['kbase-ui']);
            return Promise.all([expanded, saveIni(root.concat(['deploy.cfg']), kbDeployConfig)]);
        })
        .spread(function(configContents) {
            var dest = root.concat(['build', 'client', 'modules', 'config', 'service.yml']).join('/');
            return fs.writeFileAsync(dest, configContents);
        })
        .then(function() {
            fs.readFileAsync(root.concat(['config', 'deploy', 'templates', 'build-info.js']).join('/'), 'utf8')
                .then(function(template) {
                    var dest = root.concat(['build', 'client', 'build-info.js']).join('/');
                    var out = handlebars.compile(template)(state.buildInfo);
                    return fs.writeFileAsync(dest, out);
                });
        })
        // Rewrite the main entry point html files to add in cache-busting via the git commit hash
        .then(function() {
            Promise.all(['index.html', 'load-narrative.html', 'loading.html'].map(function(fileName) {
                    return Promise.all([fileName, fs.readFileAsync(root.concat(['build', 'client', fileName]).join('/'), 'utf8')]);
                }))
                .then(function(templates) {
                    return Promise.all(templates.map(function(template) {
                        var dest = root.concat(['build', 'client', template[0]]).join('/');
                        var out = handlebars.compile(template[1])(state.buildInfo);
                        return fs.writeFileAsync(dest, out);
                    }));
                })
        })
        // .then(function () {
        //     var dest = root.concat(['build', 'client', 'modules', 'config', 'build-info.json']).join('/');
        //     return fs.writeFileAsync(dest, JSON.stringify(state.buildInfo));
        // })
        .then(function() {
            return state;
        });
}

function cleanup(state) {
    var root = state.environment.path;
    return fs.removeAsync(root.concat(['build', 'bower_components']).join('/'))
        //.then(function () {
        //    return fs.removeAsync(root.concat(['build', 'bower.json']).join('/'));
        //})
        .then(function() {
            return fs.removeAsync(root.concat(['bower.json']).join('/'));
        })
        .then(function() {
            return fs.removeAsync(root.concat(['build', 'install', 'package.json']).join('/'));
        })
        .then(function() {
            return state;
        });
}

function makeBaseBuild(state) {
    var root = state.environment.path,
        buildPath = ['..', 'build'];

    return fs.removeAsync(buildPath.concat(['build']).join('/'))
        .then(function() {
            return fs.moveAsync(root.concat(['config']).join('/'), root.concat(['build', 'config']).join('/'));
        })
        .then(function() {
            return fs.moveAsync(root.concat(['install']).join('/'), root.concat(['build', 'install']).join('/'));
        })
        .then(function() {
            return fs.copyAsync(root.concat(['build']).join('/'), buildPath.concat(['build']).join('/'));
        })
        .then(function() {
            return state;
        });
}


function makeDistBuild(state) {
    var root = state.environment.path,
        buildPath = ['..', 'build'],
        uglify = require('uglify-js');

    return fs.copyAsync(root.concat(['build']).join('/'), root.concat(['dist']).join('/'))
        .then(function() {
            return glob(root.concat(['dist', 'client', 'modules', '**', '*.js']).join('/'))
                .then(function(matches) {
                    // TODO: incorporate a sustainable method for omitting
                    // directories from alteration.
                    // FORNOW: we need to protect iframe-based plugins from having
                    // their plugin code altered.
                    var reProtected = /\/modules\/plugins\/.*?\/iframe_root\//;
                    return Promise.all(matches
                        .filter(function(match) {
                            return !reProtected.test(match);
                        })
                        .map(function(match) {
                            var result = uglify.minify(match);
                            return fs.writeFileAsync(match, result.code);
                        }));
                });
        })
        .then(function() {
            return fs.removeAsync(buildPath.concat(['dist']).join('/'));
        })
        .then(function() {
            return fs.copyAsync(root.concat(['dist']).join('/'), buildPath.concat(['dist']).join('/'));
        })
        .then(function() {
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
        },
        {
            cwd: ['..'],
            files: ['bower.json']
        },
        {
            cwd: ['..'],
            path: ['install']
        }
    ];
    return pathExists('../dev/config')
        .then(function(exists) {
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
        .then(function(config) {
            console.log('Creating initial state with config: ');
            // console.log(config);
            return mutant.createInitialState(config);
        })
        .then(function(state) {
            return mutant.copyState(state);
        })
        .then(function(state) {
            console.log('Setting up build...');
            return setupBuild(state);
        })

    // .then(function (state) {
    //     return mutant.copyState(state);
    // })
    // .then(function (state) {
    //     return makeBuildInfo(state);
    // })

    .then(function(state) {
            return mutant.copyState(state);
        })
        .then(function(state) {
            console.log('Fetching bower packages...');
            return fetchPackagesWithBower(state);
        })

    .then(function(state) {
            return mutant.copyState(state);
        })
        .then(function(state) {
            console.log('Installing bower packages...');
            return installBowerPackages(state);
        })

    .then(function(state) {
            return mutant.copyState(state);
        })
        .then(function(state) {
            console.log('Installing Plugins...');
            return installPlugins(state);
        })


    .then(function(state) {
            return mutant.copyState(state);
        })
        .then(function(state) {
            console.log('Installing Modules...');
            return installModules(state);
        })

    .then(function(state) {
            return mutant.copyState(state);
        })
        .then(function(state) {
            console.log('Installing Module Packages from Bower...');
            return installModulePackagesFromBower(state);
        })

    //        .then(function (state) {
    //            return mutant.copyState(state);
    //        })
    //        .then(function (state) {
    //            return installModulePackagesFromFilesystem(state);
    //        })

    .then(function(state) {
            return mutant.copyState(state);
        })
        .then(function(state) {
            console.log('Copying config files...');
            return copyUiConfig(state);
        })

    .then(function(state) {
            return mutant.copyState(state);
        })
        .then(function(state) {
            console.log('Creating build record ...');
            return createBuildInfo(state);
        })

    .then(function(state) {
            return mutant.copyState(state);
        })
        .then(function(state) {
            console.log('Making KBase Config...');
            return makeKbConfig(state);
        })

    // Disable temporarily ... we don't want to wipe out bower.json
    // until we have determined if we will be building a dist.
    .then(function(state) {
            return mutant.copyState(state);
        })
        .then(function(state) {
            console.log('Cleaning up...');
            return cleanup(state);
        })




    // From here, we can make a dev build, make a release
    .then(function(state) {
            return mutant.copyState(state);
        })
        .then(function(state) {
            console.log('Making the base build...');
            return makeBaseBuild(state);
        })

    .then(function(state) {
            return mutant.copyState(state);
        })
        .then(function(state) {
            if (state.config.build.dist) {
                console.log('Making the dist build...');
                return makeDistBuild(state);
            }
            return state;
        })

    // Here we handle any developer links.
    //.then(function (state) {
    //    return mutant.copyState(state);
    //})
    //.then(function (state) {
    //    
    //})

    .then(function(state) {
            return mutant.finish(state);
        })
        .catch(function(err) {
            console.log('ERROR');
            console.log(err);
            console.log(util.inspect(err, {
                showHidden: false,
                depth: 10
            }));
            console.log(err.stack);
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