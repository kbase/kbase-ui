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

/*eslint-env node */
/*eslint strict: ["error", "global"], no-console: 0 */
'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const pathExists = require('path-exists');
const mutant = require('./mutant');
const yaml = require('js-yaml');
const glob = Promise.promisify(require('glob').Glob);
const exec = require('child_process').exec;
const util = require('util');
const handlebars = require('handlebars');
const numeral = require('numeral');
const tar = require('tar');
const yargs = require('yargs');

// UTILS
function run(command, {ignoreStdErr = false, verbose = false,  options = {}} = {}) {
    return new Promise(function (resolve, reject) {
        const proc = exec(command, options, function (err, stdout, stderr) {
            if (err) {
                reject(err);
            }
            if (stderr && !ignoreStdErr) {
                console.error('RUN error:', stderr);
                reject(new Error(stderr));
            }
            resolve(stdout);
        });
        if (verbose) {
            return proc.stdout.pipe(process.stdout);
        }
        return proc;
    });
}

function gitClone(url, dest, branch = 'master') {
    const commandLine = ['git clone --quiet --depth 1', '--branch', branch, url, dest].join(' ');
    console.log('git cloning...', commandLine);
    return run(commandLine, {ignoreStdErr: true});
}

function gitInfo(state) {
    // fatal: no tag exactly matches 'bf5efa0810d9f097b7c6ba8390f97c008d98d80e'
    return Promise.all([
        run('git show --format=%H%n%h%n%an%n%at%n%cn%n%ct%n%d --name-status | head -n 8'),
        run('git log -1 --pretty=%s'),
        run('git log -1 --pretty=%N'),
        run('git config --get remote.origin.url'),
        run('git rev-parse --abbrev-ref HEAD'),
        run('git describe --exact-match --tags $(git rev-parse HEAD)').catch(function () {
            // For non-prod ui we can be tolerant of a missing version, but not for prod.
            if (state.buildConfig.release) {
                throw new Error('This is a release build, a semver tag is required');
            }
            mutant.log('Not on a tag, but that is ok since this is not a release build');
            mutant.log('version will be unavailable in the ui');
            return '';
        })
    ]).spread(function (infoString, subject, notes, url, branch, tag) {
        const info = infoString.split('\n');
        let version;
        tag = tag.trim('\n');
        if (/^fatal/.test(tag)) {
            version = null;
        } else {
            const m = /^v([\d]+)\.([\d]+)\.([\d]+)$/.exec(tag);
            if (m) {
                version = m.slice(1).join('.');
            } else {
                version = null;
            }
        }

        // in Travis, the origin url may end in .git, remove it if so.
        // another way, but more can go wrong...
        // let [_m, originUrl] = url.match(/^(https:.+?)(?:[.]git)?$/) || [];

        url = url.trim('\n');
        if (url.endsWith('.git')) {
            url = url.slice(0, -4);
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
            originUrl: url,
            branch: branch.trim('\n'),
            tag: tag,
            version: version
        };
    });
}

// SUB TASKS

function dirList(dir) {
    return fs
        .readdirAsync(dir.join('/'))
        .then(function (files) {
            return files.map(function (file) {
                return dir.concat([file]);
            });
        })
        .then(function (files) {
            return Promise.all(
                files.map(function (file) {
                    return fs.statAsync(file.join('/')).then(function (stats) {
                        return {
                            stats: stats,
                            path: file
                        };
                    });
                })
            );
        })
        .then(function (files) {
            return files.filter(function (file) {
                return file.stats.isDirectory();
            });
        });
}

function fetchPluginsFromGithub(state) {
    // Load plugin config
    const root = state.environment.path;
    let pluginConfig;
    const pluginConfigFile = root.concat(['config', 'plugins.yml']).join('/');
    const gitDestination = root.concat(['gitDownloads']);

    return fs
        .mkdirsAsync(gitDestination.join('/'))
        .then(() => {
            return Promise.all([fs.readFileAsync(pluginConfigFile, 'utf8')]);
        })
        .spread(function (pluginFile) {
            pluginConfig = yaml.safeLoad(pluginFile);
        })
        .then(function () {
            // First generate urls to all the plugin repos.
            const githubPlugins = pluginConfig.plugins
                .filter(function (plugin) {
                    return (typeof plugin === 'object' && !plugin.internal && plugin.source.github);
                });
            return Promise.each(githubPlugins, (plugin) => {
                const repoName = plugin.source.github.name || plugin.globalName,
                    version = plugin.version,
                    branch = plugin.source.github.branch || (version ? 'v' + version : null),
                    gitAccount = plugin.source.github.account || 'kbase',
                    url = plugin.source.github.url || 'https://github.com/' + gitAccount + '/' + repoName;

                const dest = gitDestination.concat([plugin.name]).join('/');
                mutant.log(`... cloning plugin repo ${plugin.globalName}, version ${version}, branch: ${branch}`);
                return gitClone(url, dest, branch);
            });
        })
        .then(() => {
            return state;
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
    const root = state.environment.path,
        configPath = root.concat(['build', 'client', 'modules', 'config']),
        pluginConfigFile = root.concat(['config', 'plugins.yml']).join('/');

    return fs
        .ensureDirAsync(configPath.join('/'))
        .then(() => {
            return fs.readFileAsync(pluginConfigFile, 'utf8');
        })
        .then((pluginFile) => {
            return yaml.safeLoad(pluginFile);
        })
        .then((pluginConfig) => {
            const plugins = {};
            pluginConfig.plugins.forEach((pluginItem) => {
                if (typeof pluginItem === 'string') {
                    // internal plugins are specified by just their string name.
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

            // Save this as a json file; this is the config that kbase-ui will load at runtime.
            return fs.writeFileAsync(configPath.concat(['plugins.json']).join('/'), JSON.stringify({plugins}));
        })
        .then(() => {
            return state;
        });
}

function yarn(cmd, argv, options) {
    return new Promise(function (resolve, reject) {
        exec('yarn ' + cmd + ' ' + argv.join(' '), options, function (err, stdout, stderr) {
            if (err) {
                reject(err);
            }
            if (stderr) {
                // reject(new Error(stderr));
                resolve({
                    warnings: stderr
                });
            }
            resolve({
                result: stdout
            });
        });
    });
}

async function yarnInstall(state) {
    const base = state.environment.path.concat(['build']);
    const packagePath = base.concat(['package.json']);
    const packageConfig = await mutant.loadJson(packagePath);
    delete packageConfig.devDependencies;
    await mutant.saveJson(packagePath, packageConfig);
    return yarn('install', [], {
        cwd: base.join('/'),
        timeout: 300000
    });
}

function copyFromNodeNodules(state) {
    const root = state.environment.path;

    return mutant.loadYaml(root.concat(['config', 'npmInstall.yml']))
        .then((config) => {
            const copyJobs = [];

            config.npmFiles.forEach(function (cfg) {
            /*
                 The top level bower directory name is usually the name of the
                 package (which also is often also base of the sole json file name)
                 but since this is not always the case, we allow the dir setting
                 to override this.
                 */
                const dir = cfg.dir || cfg.name;
                let sources;
                let cwd;
                let dest;
                if (!dir) {
                    throw new Error(
                        'Either the name or dir property must be provided to establish the top level directory'
                    );
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
                    cwd = ['build', 'node_modules', dir].concat(cfg.cwd);
                } else {
                    cwd = ['build', 'node_modules', dir];
                }

                /*
                 The destination will be composed of 'node_modules' at the top
                 level, then the package name or dir (as specified above).
                 This is the core of our "thinning and flattening", which is part of the
                 point of this bower copy process.
                 In addition, if the spec includes a dest property, we will use that
                 */
                if (cfg.standalone) {
                    dest = ['build', 'client', 'modules'].concat([cfg.name]);
                } else {
                    dest = ['build', 'client', 'modules', 'node_modules'].concat([cfg.dir || cfg.name]);
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
            return Promise.all(
                copyJobs.map((copySpec) => {
                    return glob(copySpec.src, {
                        cwd: state.environment.path.concat(copySpec.cwd).join('/'),
                        nodir: true
                    })
                        .then((matches) => {
                        // Do the copy!
                            return Promise.all(
                                matches.map((match) => {
                                    const fromPath = state.environment.path
                                            .concat(copySpec.cwd)
                                            .concat([match])
                                            .join('/'),
                                        toPath = state.environment.path
                                            .concat(copySpec.dest)
                                            .concat([match])
                                            .join('/');
                                    return fs.copy(fromPath, toPath, {});
                                })
                            );
                        })
                        .then(() => {
                            return state;
                        });
                })
            );
        });
}

function fetchPlugins(state) {
    state.steps = [];
    return fetchPluginsFromGithub(state)
        .then((state) => {
            mutant.log('Inject Plugins Into Config');
            return injectPluginsIntoConfig(state);
        })
        .then(function () {
            return state;
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
function installPlugins(state) {
    // Load plugin config
    const root = state.environment.path;
    let pluginConfig;
    const pluginConfigFile = root.concat(['config', 'plugins.yml']).join('/');
    return (
        fs
            .readFileAsync(pluginConfigFile, 'utf8')
            .then((pluginFile) => {
                pluginConfig = yaml.safeLoad(pluginFile);
                const plugins = pluginConfig.plugins;
                return Promise.all(
                    // Supports installing from gitDownloads (which are downloaded prior to this)
                    plugins
                        .filter((plugin) => {
                            return typeof plugin === 'object' && plugin.source.github;
                        })
                        .map((plugin) => {
                            const pluginDir = root.concat(['gitDownloads', plugin.name]);
                            const destDir = root.concat(['build', 'client', 'modules', 'plugins', plugin.name]);
                            const distFile = pluginDir.concat(['dist.tgz']);
                            if (!pathExists.sync(distFile.join('/'))) {
                                throw new Error('git plugin ${plugin.name} does not have a dist.tgz');
                            }

                            mutant.info(`${plugin.name}: plugin installing from dist.tgz`);
                            tar.extract({
                                cwd: pluginDir.join('/'),
                                file: distFile.join('/'),
                                sync: true
                            });
                            const srcDir = pluginDir.concat(['dist', 'plugin']);
                            mutant.ensureDir(destDir);
                            return mutant.copyFiles(srcDir, destDir, '**/*');
                        })
                )
                    .then(() => {
                        // Supports installing from a directory
                        return Promise.all(
                            plugins
                                .filter((plugin) => {
                                    return typeof plugin === 'object' && plugin.source.directory;
                                })
                                .map((plugin) => {
                                    const cwds = plugin.cwd || 'dist/plugin',
                                        cwd = cwds.split('/'),
                                        // Our actual cwd is mutations, so we need to escape one up to the
                                        // project root.
                                        repoRoot = (plugin.source.directory.root &&
                                            plugin.source.directory.root.split('/')) || ['', 'kb', 'plugins'],
                                        source = repoRoot.concat([plugin.name]).concat(cwd),
                                        destination = root.concat([
                                            'build',
                                            'client',
                                            'modules',
                                            'plugins',
                                            plugin.name
                                        ]);
                                    mutant.ensureDir(destination);
                                    return mutant.copyFiles(source, destination, '**/*');
                                })
                        );
                    })
                    .then(() => {
                        // Supports internal plugins.
                        return Promise.all(
                            plugins
                                .filter((plugin) => {
                                    return typeof plugin === 'string';
                                })
                                .map((plugin) => {
                                    const source = root.concat(['plugins', plugin]),
                                        destination = root.concat(['build', 'client', 'modules', 'plugins', plugin]);
                                    mutant.ensureDir(destination);
                                    return mutant.copyFiles(source, destination, '**/*');
                                })
                        );
                    });
            })
            // now move the test files into the test dir
            .then(() => {
                // dir list of all plugins
                const pluginsPath = root.concat(['build', 'client', 'modules', 'plugins']);
                return dirList(pluginsPath).then((pluginDirs) => {
                    return Promise.each(pluginDirs, (pluginDir) => {
                        // Has integration tests?
                        const testDir = pluginDir.path.concat(['test']);
                        return pathExists(testDir.join('/')).then((exists) => {
                            const justDir = pluginDir.path[pluginDir.path.length - 1];
                            if (!exists) {
                                mutant.warn('plugin without tests: ' + justDir);
                            } else {
                                mutant.success('plugin with tests!  : ' + justDir);
                                const dest = root.concat(['test', 'integration-tests', 'specs', 'plugins', justDir]);
                                return fs.moveAsync(testDir.join('/'), dest.join('/'));
                            }
                        });
                    });
                });
            })
            .then(() => {
                return state;
            })
    );
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
    const root = state.environment.path;
    state.steps = [];
    return mutant
        .deleteMatchingFiles(root.join('/'), /.*\.DS_Store$/)
        .then(() => {
            // the client really now becomes the build!
            const from = root.concat(['src', 'client']),
                to = root.concat(['build', 'client']);
            return fs.moveAsync(from.join('/'), to.join('/'));
        })
        .then(() => {
            // the client really now becomes the build!
            const from = root.concat(['src', 'test']),
                to = root.concat(['test']);
            return fs.moveAsync(from.join('/'), to.join('/'));
        })
        .then(() => {
            // the client really now becomes the build!
            const from = root.concat(['src', 'plugins']),
                to = root.concat(['plugins']);
            return fs.moveAsync(from.join('/'), to.join('/'));
        })
        .then(() => {
            return fs.moveAsync(
                root.concat(['package.json']).join('/'),
                root.concat(['build', 'package.json']).join('/')
            );
        })
        .then(() => {
            return fs.rmdirAsync(root.concat(['src']).join('/'));
        })
        .then(() => {
            return state;
        });
}


function installNPMPackages(state) {
    return yarnInstall(state)
        .then(() => {
            return fs.remove(state.environment.path.concat(['build', 'package.json']).join('/'));
        })
        .then(() => {
            return copyFromNodeNodules(state);
        })
        .then(() => {
            return state;
        });
}

async function removeSourceMaps(state) {
    const dir = state.environment.path
        .concat(['build', 'client']);
    await mutant.removeSourceMappingCSS(dir);
    await mutant.removeSourceMappingJS(dir);
    return state;
}

/*
 *
 * Copy the ui configuration files into the build.
 * settings.yml
 */
function makeUIConfig(state) {
    const root = state.environment.path,
        releaseVersionConfig = root.concat(['config', 'release.yml']),
        configFiles = [releaseVersionConfig],
        configDest = root.concat(['build', 'client', 'modules', 'config']);

    return Promise.all(
        configFiles.map((file) => {
            return mutant.loadYaml(file);
        })
    )
        .then((configs) => {
            return mutant.mergeObjects([{}].concat(configs));
        })
        .then((mergedConfigs) => {
            state.uiConfig = mergedConfigs;
            return mutant.saveJson(configDest.concat(['ui.json']), mergedConfigs);
        })
        .then(() => {
            return state;
        });
}

function createBuildInfo(state) {
    return gitInfo(state).then((gitInfo) => {
        const root = state.environment.path,
            configDest = root.concat(['build', 'client', 'modules', 'config', 'buildInfo.json']),
            buildInfo = {
                target: state.buildConfig.target,
                stats: state.stats,
                git: gitInfo,
                // disabled for now, all uname packages are failing!
                hostInfo: null,
                builtAt: new Date().getTime()
            };
        state.buildInfo = buildInfo;
        return mutant.saveJson(configDest, {buildInfo: buildInfo})
            .then(function () {
                return state;
            });
    });
}

function getReleaseNotes(state, version) {
    // lives in release-notes/RELEASE_NOTES_#.#.#.md
    const root = state.environment.path;
    const releaseNotesPath = root.concat(['release-notes', 'RELEASE_NOTES_' + version + '.md']);
    return fs.readFileAsync(releaseNotesPath.join('/'), 'utf8').catch(function (err) {
        mutant.warn('release notes file not found: ' + releaseNotesPath.join('/'), err);
        return null;
    });
}

function verifyVersion(state) {
    return Promise.try(function () {
        if (!state.buildConfig.release) {
            mutant.log('In a non-prod build, release version not checked.');
            return;
        }

        const releaseVersion = state.uiConfig.release.version;
        const gitVersion = state.buildInfo.git.version;

        if (!releaseVersion) {
            throw new Error('this is a release build, and the release version is missing.');
        }

        const semverRe = /\d+\.\d+\.\d+$/;
        const gitSemverRe = /^v\d+\.\d+\.\d+$/;

        if (!semverRe.test(releaseVersion)) {
            throw new Error(
                'on a release build, and the release version doesn\'t look like a semver tag: ' + releaseVersion
            );
        }
        mutant.success('good release version');

        if (!gitSemverRe.test(state.buildInfo.git.tag)) {
            throw new Error(
                'on a release build, and the git tag doesn\'t look like a semver tag: ' + state.buildInfo.git.tag
            );
        }
        mutant.success('good git tag version');

        if (releaseVersion === gitVersion) {
            mutant.success('release and git agree on version ' + releaseVersion);
        } else {
            throw new Error(
                'Release and git versions are different; release says "' +
                releaseVersion +
                '", git says "' +
                gitVersion +
                '"'
            );
        }
        return getReleaseNotes(state, releaseVersion)
            .then((releaseNotesFile) => {
                if (releaseNotesFile) {
                    mutant.success('have release notes');
                } else {
                    throw new Error(
                        'Release notes not found for this version ' + releaseVersion + ', but required for a release'
                    );
                }
            });
    }).then(function () {
        return state;
    });
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
 * We pick one of the pre-configured deploy config files based on the deploy
 * target key passed in and found on state.config.targets.kbDeployConfig
 */
function makeConfig(state) {
    const root = state.environment.path,
        deployModules = root.concat(['build', 'client', 'modules', 'deploy']);

    return (
        Promise.all([fs.mkdirsAsync(deployModules.join('/'))])
            .then(function () {
                // A bit weird to do this here...
                return fs
                    .readFileAsync(root.concat(['build', 'client', 'build-info.js.txt']).join('/'), 'utf8')
                    .then(function (template) {
                        const dest = root.concat(['build', 'client', 'build-info.js']).join('/');
                        const out = handlebars.compile(template)(state.buildInfo);
                        return fs.writeFileAsync(dest, out);
                    })
                    .then(function () {
                        fs.removeAsync(root.concat(['build', 'client', 'build-info.js.txt']).join('/'));
                    });
            })
            // Now merge the configs.
            .then(function () {
                const configs = [
                    // root.concat(['config', 'services.yml']),
                    root.concat(['build', 'client', 'modules', 'config', 'ui.json']),
                    root.concat(['build', 'client', 'modules', 'config', 'buildInfo.json'])
                ];
                return Promise.all(configs.map(mutant.loadJson))
                    .then((configs) => {
                        const merged = mutant.mergeObjects(configs);
                        const dest = root.concat(['build', 'client', 'modules', 'config', 'config.json']);
                        return mutant.saveJson(dest, merged);
                    })
                    .then(function () {
                        return Promise.all(
                            configs.map(function (file) {
                                fs.remove(file.join('/'));
                            })
                        );
                    });
            })
            .then(function () {
                return state;
            })
    );
}

function addCacheBusting(state) {
    const root = state.environment.path;
    return Promise.all(
        ['index.html', 'load-narrative.html'].map((fileName) => {
            return Promise.all([
                fileName,
                fs.readFileAsync(root.concat(['build', 'client', fileName]).join('/'), 'utf8')
            ]);
        })
    )
        .then((templates) => {
            return Promise.all(
                templates.map((template) => {
                    const dest = root.concat(['build', 'client', template[0]]).join('/');
                    const out = handlebars.compile(template[1])(state);
                    return fs.writeFileAsync(dest, out);
                })
            );
        })
        .then(() => {
            return state;
        });
}

function cleanup(state) {
    const root = state.environment.path;
    return fs.removeAsync(root.concat(['build', 'node_modules']).join('/'))
        .then(function () {
            return state;
        });
}

function makeDist(state) {
    const root = state.environment.path;
    const buildPath = state.environment.rootDir.concat(['build']);
    const distPath = state.environment.rootDir.concat(['build', 'dist']);

    return fs
        .removeAsync(distPath.join('/'))
        .then(function () {
            mutant.log('Copying config...');
            return fs.moveAsync(root.concat(['config']).join('/'), distPath.concat(['config']).join('/'));
        })
        .then(function () {
            mutant.log('Copying build...');
            return fs.copyAsync(root.concat(['build', 'client']).join('/'), distPath.concat(['client']).join('/'));
        })
        .then(function () {
            mutant.log('Copying test...');
            return fs.copyAsync(root.concat(['test']).join('/'), buildPath.concat(['test']).join('/'));
        })
        .then(function () {
            return state;
        });
}

/* makeRelease(state)
Responsible for copying the build to the dist directory, as the above function does,
and also processing the files:
- minify
- TODO: add more processing here?
*/
function makeRelease(state) {
    const root = state.environment.path,
        uglify = require('uglify-es');

    return glob(root.concat(['client', 'modules', '**', '*.js']).join('/'), {
        nodir: true
    })
        .then((matches) => {
            // TODO: incorporate a sustainable method for omitting
            // directories from alteration.
            // FORNOW: we need to protect iframe-based plugins from having
            // their plugin code altered.
            const reProtected = /\/modules\/plugins\/.*?\/iframe_root\//;
            const files = matches.filter(function (match) {
                return !reProtected.test(match);
            });
            return Promise.all(files)
                .mapSeries((match) => {
                    return fs.readFileAsync(match, 'utf8')
                        .then((contents) => {
                            // see https://github.com/mishoo/UglifyJS2 for options
                            // just overriding defaults here
                            const result = uglify.minify(contents, {
                                output: {
                                    beautify: false,
                                    max_line_len: 80,
                                    quote_style: 0
                                },
                                compress: {
                                    // required in uglify-es 3.3.10 in order to work
                                    // around a bug in the inline implementation.
                                    // it should be fixed in an upcoming release.
                                    inline: 1
                                },
                                safari10: true
                            });

                            if (result.error) {
                                console.error('Error minifying file: ' + match, result);
                                throw new Error('Error minifying file ' + match) + ':' + result.error;
                            } else if (result.code.length === 0) {
                                mutant.warn('Skipping empty file: ' + match);
                            } else {
                                return fs.writeFileAsync(match, result.code);
                            }
                        });
                });
        })
        .then(function () {
            return state;
        });
}

function makeModuleVFS(state) {
    const root = state.environment.path;
    const buildPath = state.environment.rootDir.concat(['build']);

    return glob(root.concat(['dist', 'client', 'modules', '**', '*']).join('/'), {
        nodir: true,
        exclude: [['dist', 'client', 'modules', 'deploy', 'config.json']]
    })
        .then(function (matches) {
            // just read in file and build a giant map...
            const vfs = {
                scripts: {},
                resources: {
                    json: {},
                    text: {},
                    csv: {},
                    css: {}
                }
            };
            const vfsDest = buildPath.concat(['dist', 'client', 'moduleVfs.js']);
            const skipped = {};

            function skip(ext) {
                if (!skipped[ext]) {
                    skipped[ext] = 1;
                } else {
                    skipped[ext] += 1;
                }
            }
            const included = {};

            function include(ext) {
                if (!included[ext]) {
                    included[ext] = 1;
                } else {
                    included[ext] += 1;
                }
            }

            function showStats(db) {
                Object.keys(db)
                    .map(function (key) {
                        return {
                            key: key,
                            count: db[key]
                        };
                    })
                    .sort(function (a, b) {
                        return b.count - a.count;
                    })
                    .forEach(function (item) {
                        mutant.log(item.key + ':' + item.count);
                    });
            }
            const exceptions = [/\/modules\/plugins\/.*?\/iframe_root\//];
            const cssExceptions = [/@import/, /@font-face/];
            const supportedExtensions = ['js', 'yaml', 'yml', 'json', 'text', 'txt', 'css'];
            return Promise.all(matches)
                .mapSeries(function (match) {
                    const relativePath = match.split('/').slice(root.length + 2);
                    const path = '/' + relativePath.join('/');

                    // exclusion based on path pattern
                    if (
                        exceptions.some(function (re) {
                            return re.test(path);
                        })
                    ) {
                        skip('excluded');
                        return;
                    }

                    const m = /^(.*)\.([^.]+)$/.exec(path);

                    // bare files we don't support
                    if (!m) {
                        skip('no extension');
                        mutant.warn('module vfs cannot include file without extension: ' + path);
                    }
                    const base = m[1];
                    const ext = m[2];

                    // skip if in unsupported extensions
                    if (supportedExtensions.indexOf(ext) === -1) {
                        skip(ext);
                        return;
                    }

                    return fs.statAsync(match).then(function (stat) {
                        if (stat.size > 200000) {
                            mutant.warn(
                                'omitting file from bundle because too big: ' + numeral(stat.size).format('0.0b')
                            );
                            mutant.warn('  ' + match);
                            mutant.warn('   don\'t worry, it is stil included in the build!');
                            skip('toobig');
                            return;
                        }
                        return fs.readFileAsync(match, 'utf8').then(function (contents) {
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
                                if (
                                    cssExceptions.some(function (re) {
                                        return re.test(contents);
                                    })
                                ) {
                                    skip('css excluded');
                                } else {
                                    include(ext);
                                    vfs.resources.css[base] = contents;
                                }
                                break;
                            case 'csv':
                                skip(ext);
                                break;
                            default:
                                skip(ext);
                            }
                        });
                    });
                })
                .then(function () {
                    mutant.log('vfs created');
                    mutant.log('skipped: ');
                    showStats(skipped);
                    mutant.log('included:');
                    showStats(included);
                    const modules =
                        '{' +
                        Object.keys(vfs.scripts)
                            .map(function (path) {
                                return '"' + path + '": ' + vfs.scripts[path];
                            })
                            .join(', \n') +
                        '}';
                    const script = [
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
    return (
        Promise.try(async function () {
            const rootDir = (await getRoot()).split('/');
            // STEP 1: Create iniital build state.
            mutant.log('STEP 1: Creating initial state for build: ' + type);
            const initialFilesystem = [
                {
                    path: ['src', 'client']
                },
                {
                    path: ['src', 'plugins']
                },
                {
                    path: ['src', 'test']
                },
                {
                    files: ['package.json']
                },
                {
                    path: ['release-notes']
                },
                {
                    path: ['config']
                }
            ];
            const buildControlConfigPath = ['config', 'build', type + '.yml'];
            const buildControlDefaultsPath = ['config', 'build', 'defaults.yml'];
            const config = {
                rootDir,
                initialFilesystem,
                buildControlConfigPath,
                buildControlDefaultsPath
            };
            return mutant.createInitialState(config);
        })
            // STEP 2: Set up the build, mostly putting files into their starting positions out of src.
            // Moves files out of src and into build or root dir
            .then((state) => {
                return mutant.copyState(state);
            })
            .then((state) => {
                mutant.log('STEP 2: Setting up build...');
                return setupBuild(state);
            })

            // STEP 3: Install npm dependencies
            .then((state) => {
                return mutant.copyState(state);
            })
            .then((state) => {
                mutant.log('STEP 3: Installing NPM packages with YARN...');
                return installNPMPackages(state);
            })

            // STEP 4: Remove source mapping from .js and .css files which have it
            // Remove source mapping from the ui - do this before introducing
            // the plugins in order to simplify omitting those files.
            .then((state) => {
                return mutant.copyState(state);
            })
            .then((state) => {
                mutant.log('STEP 4: Removing source maps...');
                return removeSourceMaps(state);
            })

            // STEP 5: Get external plugins from github and prepare the plugin load config for runtime usage.
            .then((state) => {
                return mutant.copyState(state);
            })
            .then((state) => {
                mutant.log('STEP 5: Fetching plugins...');
                return fetchPlugins(state);
            })

            // STEP 6: Unpack plugins and move them into their final resting place.
            .then((state) => {
                return mutant.copyState(state);
            })
            .then((state) => {
                mutant.log('STEP 6: Installing Plugins...');
                return installPlugins(state);
            })

            // STEP 7: Creates the core ui config file, ui.json, and stores it in the state
            .then((state) => {
                return mutant.copyState(state);
            })
            .then((state) => {
                mutant.log('STEP 7: Copying config files...');
                return makeUIConfig(state);
            })

            // STEP 8: Creates a config file containing build-time information
            .then((state) => {
                return mutant.copyState(state);
            })
            .then((state) => {
                mutant.log('STEP 8: Creating build record ...');
                return createBuildInfo(state);
            })

            // STEP 9: Verify the tag and release info if this is a release build
            // Here we verify that the version stamp, release notes, and tag are consistent.
            // For prod we need to compare all three and fail the build if there is not a match.
            // For dev, we need to compare the stamp and release notes, not the tag.
            // At some future time when working solely off of master, we will be able to compare
            // to the most recent tag.
            .then((state) => {
                return mutant.copyState(state);
            })
            .then((state) => {
                mutant.log('STEP 9: Verifying version...');
                return verifyVersion(state);
            })

            // STEP 10: This step creates the main config file and build-info.js
            .then((state) => {
                return mutant.copyState(state);
            })
            .then(function (state) {
                mutant.log('STEP 10: aking main config file...');
                return makeConfig(state);
            })

            // STEP 11: Add cache-busting in html files by template substitution.
            .then((state) => {
                return mutant.copyState(state);
            })
            .then((state) => {
                mutant.log('Adding cache busting to html templates...');
                return addCacheBusting(state);
            })

            // STEP 12. Clean up build artifacts
            .then((state) => {
                return mutant.copyState(state);
            })
            .then((state) => {
                mutant.log('STEP 12. Cleaning up...');
                return cleanup(state);
            })

            // STEP 13. If this is a release, do extra processing of the build
            .then((state) => {
                return mutant.copyState(state);
            })
            .then((state) => {
                if (state.buildConfig.release) {
                    mutant.log('STEP 13. Processing for release...');
                    return  makeRelease(state);
                } else {
                    mutant.log('Not a release, skipping makeRelease...');
                    return state;
                }
            })

            // STEP 14. Copies the build files from working directory to the final destination
            .then((state) => {
                return mutant.copyState(state);
            })
            .then((state) => {
                mutant.log('STEP 14. Making the base build...');
                return makeDist(state);
            })


        // STEP 15. Remove the
        // Note - no reason to copy state any longer since we are not using
        // the temp build filesystem any longer.
        // .then((state) => {
        //     return removeBuild(state);
        // })

            // STEP 15. Create the Virtual File System (VFS) if specified in the build config.
            .then((state) => {
                if (state.buildConfig.vfs) {
                    return makeModuleVFS(state);
                } else {
                    return state;
                }
            })
            .then((state) => {
                return mutant.finish(state);
            })
    );
}

async function getRoot() {
    const out = await run('git rev-parse --show-toplevel', {options: {
        encoding: 'utf8'
    }});
    return out.trim();
}

function usage() {
    console.error('usage: node build <config>');
}

const args = yargs.parse(process.argv.slice(2));

const buildType = args.config;

if (buildType === undefined) {
    console.error('Build config not specified');
    usage();
    process.exit(1);
}

main(buildType).catch((err) => {
    console.error('ERROR');
    console.error(err);
    console.error(
        util.inspect(err, {
            showHidden: false,
            depth: 10
        })
    );
    console.error(err.message);
    console.error(err.name);
    console.error(err.stack);
    process.exit(1);
});