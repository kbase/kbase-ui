/*global define*/
/*jslint white: true,browser:true*/

/**
 * Gruntfile for kbase-ui
 */
var Promise = require('bluebird'),
    path = require('path'),
    iniParser = require('node-ini'),
    fs = require('fs'),
    _ = require('lodash'),
    yaml = require('js-yaml'),
    readFileAsync = Promise.promisify(fs.readFile),
    writeFileAsync = Promise.promisify(fs.writeFile),
    execAsync = Promise.promisify(require('child_process').exec),
    bower = require('bower'),
    symlinkAsync = Promise.promisify(fs.symlink);

module.exports = function (grunt) {
    'use strict';

    // Here we switch to the deployment environment.
    // prod = production
    // ci = continuous integration
    var servicesTarget = 'prod',
        // set to 'test' for switching to dev menus, 'prod' for normal ones.
        uiTarget = 'test',
        BUILD_DIR = 'build',
        BUILDING_DIR = 'building',
        REPO_DIR = '..';


    /**
     * Cancels a task
     */
    function cancelTask(err) {
        var message = Array.prototype.slice.call(arguments).map(function (message) {
            return String(message);
        }).join(' ');
        console.error(message);
        process.exit(1);
    }

    // Config
    // TODO: maybe read something from the runtime/config directory so we don't 
    // need to tweak this and accidentally check it in...

    function buildDir(subdir) {
        if (subdir) {
            return path.normalize(BUILD_DIR + '/' + subdir);
        }
        return path.normalize(BUILD_DIR);
    }

    function buildingDir(subdir) {
        if (subdir) {
            return path.normalize(BUILDING_DIR + '/' + subdir);
        }
        return path.normalize(BUILDING_DIR);
    }

    function makeRepoDir(subdir) {
        if (subdir) {
            return path.normalize(REPO_DIR + '/' + subdir);
        }
        return path.normalize(REPO_DIR);
    }

    function getConfig() {
        var deployCfgFile = 'deploy-' + servicesTarget + '.cfg';
        return iniParser.parseSync(deployCfgFile);
    }

    var deployCfg = getConfig();

    // not using this yet.
    function getBuildOptions() {
        servicesTarget = grunt.option('servicesTarget'); // prod or ci
        uiTarget = grunt.option('uiTarget'); // prod or test

        if (!servicesTarget || ['prod', 'ci'].indexOf(servicesTarget) === -1) {
            cancelTask(' Invalid value for required option "servicesTarget":', servicesTarget);
        }

        if (!uiTarget || ['prod', 'test'].indexOf(uiTarget) === -1) {
            cancelTask('Invalid value for required option "uiTarget":', uiTarget);
        }
    }

    var STATE = {};
    function setTaskState(name, value) {
        STATE[name] = value;
    }
    function getTaskState(name) {
        var path = name.split('.'),
            key = path[0],
            propertyPath = path.length > 1 ? path.slice(1) : [],
            value;

        if (!STATE.hasOwnProperty(key)) {
            throw new Error('No task state with key "' + key + '"');
        }
        value = STATE[key];

        propertyPath.forEach(function (propKey) {
            if (!value.hasOwnProperty(propKey)) {
                throw new Error('No property "' + propertyPath.join('.') + ' in state key ' + propKey);
            }
            value = value[propKey];
        });
        return value;
    }

    var targetConfig;
    function loadTargetConfig() {
        var // done = this.async(),
            target = grunt.option('target');
        if (!target) {
            // load from /args.yml

            // If not there, build for production, er test.
            if (!target) {
                target = 'test';
                console.log('Using default target: ' + target);
            } else {
                console.log('Using target provided from developer defaults: ' + target);
            }
        } else {
            console.log('Using target provided form command line: ' + target);
        }

        if (!target) {
            throw new Error('Target not defined');
        }

        setTaskState('target', target);

        // Load the deployment config
        var deployConfigPath = 'targets/' + target + '/deploy.yml';

        var content = fs.readFileSync(deployConfigPath, 'utf8');
        var config = yaml.safeLoad(content);
        setTaskState('targetConfig', yaml.safeLoad(content));
    }
    loadTargetConfig();

//        readFileAsync(deployConfigPath, 'utf8')
//            .then(function (content) {
//                setTaskState('targetConfig', yaml.safeLoad(content));
//                done(targetConfig);
//            })
//            .catch(function (err) {
//                cancelTask('Error reading target config file.', err);
//            });

    // Set the services target and ui target.

//    }
//    grunt.registerTask('load-target-config',
//        'Load the specified target configuration',
//        loadTargetConfig);

    function tinkerReport() {
        console.log('TINKER');
        console.log('Target config');
        console.log(getTaskState('targetConfig'));
        console.log(getTaskState('targetConfig.uiTargetKey'));
    }
    grunt.registerTask('tinker-report', 'Report from Tinkering', tinkerReport);

    function buildConfigFile() {
        var serviceTemplateFile = 'config/service-config-template.yml',
            settingsCfg = 'config/settings.yml',
            outFile = buildDir('client/modules/app/config.yml'),
            done = this.async();

        fs.readFile(serviceTemplateFile, 'utf8', function (err, serviceTemplate) {
            if (err) {
                console.log(err);
                throw 'Error reading service template';
            }

            var compiled = _.template(serviceTemplate),
                services = compiled(deployCfg['kbase-ui']);

            fs.readFile(settingsCfg, 'utf8', function (err, settings) {
                if (err) {
                    console.log(err);
                    throw 'Error reading UI settings file';
                }

                fs.writeFile(outFile, services + '\n\n' + settings, function (err) {
                    if (err) {
                        console.log(err);
                        throw 'Error writing compiled configuration';
                    }
                    done();
                });
            });
        });
    }

    /*
     * Build the services config file (concatenated with the  miscellaneous 
     * config file) based on the services file template, the kbase standard
     * services config.
     * 
     * Note that we are using the grunt api for file access. This has the advantage
     * of being asynchronous, and building directory paths automatically.
     * 
     * @returns {undefined}
     */
    function buildingConfigFile() {
        var serviceTemplateFile = 'config/service-config-template.yml',
            serviceTemplate = grunt.file.read(serviceTemplateFile),
            settingsCfg = 'config/settings.yml',
            settings = grunt.file.read(settingsCfg),
            outFile = 'building/build/client/modules/config/config.yml',
            compiled = _.template(serviceTemplate),
            servicesConfig = compiled(deployCfg['kbase-ui']),
            concatenatedConfig = servicesConfig + '\n\n' + settings;

        grunt.file.write(outFile, concatenatedConfig);
    }
    grunt.registerTask('building-config',
        'Build the config file',
        buildingConfigFile);


    function installPlugins() {
        // Load plugin config        
        var done = this.async(),
            pluginConfig = 'plugins.yml';
        readFileAsync(pluginConfig, 'utf8')
            .then(function (content) {
                return yaml.safeLoad(content);
            })
            .then(function (config) {
                // First ensure all plugin packages are installed via bower.
                return Promise.all(config.plugins.map(function (plugin) {
                    console.log('Loading plugin: ' + plugin.name);
                    return new Promise(function (resolve, reject) {
                        bower.commands.install([plugin.install.bower.package])
                            .on('end', function (results) {
                                console.log('Updated : ' + plugin.name);
                                console.log(results);
                                resolve();
                            })
                            .on('error', function (error) {
                                reject(error);
                            });
                    })
                        .then(function () {
                            return new Promise(function (resolve, reject) {
                                bower.commands.info([plugin.install.bower.package])
                                    .on('end', function (results) {
                                        console.log('info : ' + plugin.name);
                                        console.log(results);
                                        resolve(results);
                                    })
                                    .on('error', function (error) {
                                        reject(error);
                                    });
                            });
                        });

                    //return execAsync([
                    //    'bower', 'install', plugin.install.bower.package
                    //].join(' '));                    
                }));
            })
            .then(function () {
                // Then copy them to the appropriate directory.
                done();
            })
            .catch(function (err) {
                cancelTask('Error installing plugins', err);
            });

        // Install plugins into the build directory

        // Install the plugin config into the build
    }

    function injectPluginsIntoBower() {
        // Load plugin config        
        var done = this.async(),
            pluginConfig, pluginConfigFile = 'targets/' + getTaskState('target') + '/plugin.yml',
            bowerConfig, bowerConfigFile = 'bower.json';
        Promise.all([readFileAsync(pluginConfigFile, 'utf8'), readFileAsync(bowerConfigFile, 'utf8')])
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

                return writeFileAsync('building/bower.json', JSON.stringify(bowerConfig, null, 4));
            })
            .then(function () {
                // Then copy them to the appropriate directory.
                done();
            })
            .catch(function (err) {
                cancelTask('Error installing plugins', err);
            });

        // Install plugins into the build directory

        // Install the plugin config into the build
    }
    grunt.registerTask(
        'inject-plugins-into-bower',
        'Install UI plugins',
        injectPluginsIntoBower
        );


    function injectPluginsIntoConfig() {
        // Load plugin config        
        var done = this.async(),
            pluginConfigFile = 'targets/' + getTaskState('target') + '/plugin.yml';
        readFileAsync(pluginConfigFile, 'utf8')
            .then(function (pluginFile) {
                return yaml.safeLoad(pluginFile);
            })
            .then(function (pluginConfig) {
                var newConfig = pluginConfig.plugins.map(function (pluginItem) {
                    if (typeof pluginItem === 'string') {
                        return pluginItem;
                    } else {
                        return pluginItem.name;
                    }
                });

                // emulate the yaml file for now, or for ever.
                return writeFileAsync('building/build/client/modules/config/plugin.yml', yaml.safeDump({plugins: newConfig}));
            })
            .then(function () {
                // Then copy them to the appropriate directory.
                done();
            })
            .catch(function (err) {
                cancelTask('Error installing plugins', err);
            });

        // Install plugins into the build directory

        // Install the plugin config into the build
    }
    grunt.registerTask(
        'inject-plugins-into-config',
        'Inject the plugins config file into the building build config',
        injectPluginsIntoConfig);

    /*
     * Copy plugins from the bower module installation directory into the plugins
     * directory. We _could_ reference plugins directly from the bower directory,
     * as we do for other bower-installed dependencies, but it seems to be easier
     * to keep track of (and to be able to manipulate) plugins if they are all 
     * located in a single, well-defined location.
     * 
     * @returns {undefined}
     */
    function installExternalPlugins() {
        // Load plugin config
        var done = this.async(),
            pluginConfig, pluginConfigFile = 'targets/' + getTaskState('target') + '/plugin.yml';
        Promise.all([readFileAsync(pluginConfigFile, 'utf8')])
            .spread(function (pluginFile) {
                pluginConfig = yaml.safeLoad(pluginFile);
                return pluginConfig.plugins.filter(function (plugin) {
                    if (typeof plugin !== 'string') {
                        return plugin;
                    }
                });
            })
            .then(function (externalPlugins) {
                return [externalPlugins, externalPlugins.map(function (plugin) {
                        if (plugin.bower) {
                            console.log(plugin.name);
                            console.log(plugin.copy);
                            var cwd = plugin.copy.path || 'dist/plugin',
                                srcDir = ['building/bower_components', plugin.bower.name, cwd].join('/'),
                                destDir = 'building/build/client/modules/plugins/' + plugin.name,
                                mapping = grunt.file.expandMapping(['**/*'], destDir, {
                                    cwd: srcDir,
                                    filter: 'isFile'
                                });
                            console.log('here');
                            mapping.forEach(function (fileMapping) {
                                fileMapping.src.forEach(function (sourcePath) {
                                    grunt.file.copy(sourcePath, fileMapping.dest);
                                });
                            });
                        }
                    })];
            })
            .spread(function (externalPlugins) {
                return Promise.all(externalPlugins
                    .filter(function (plugin) {
                        if (plugin.link) {
                            return true;
                        }
                        return false;
                    })
                    .map(function (plugin) {
                        if (plugin.link) {
                            /* linking won't work, but we can just copy 
                             console.log('really?');
                             console.log(plugin);
                             var cwd = plugin.copy.path || 'dist/plugin',
                             source = [plugin.link.source, cwd].join('/'),
                             destination = 'building/build/client/modules/plugins/' + plugin.name;
                             console.log('Linking...');
                             console.log(source);
                             console.log('to');
                             console.log(destination);
                             return symlinkAsync(source, destination);
                             */
                            var cwd = plugin.copy.path || 'dist/plugin',
                                source = [plugin.link.source, cwd].join('/'),
                                destination = 'building/build/client/modules/plugins/' + plugin.name,
                                mapping = grunt.file.expandMapping(['**/*'], destination, {
                                    cwd: source,
                                    filter: 'isFile'
                                });
                            // return symlinkAsync(source, destination);
                            mapping.forEach(function (fileMapping) {
                                fileMapping.src.forEach(function (sourcePath) {
                                    grunt.file.copy(sourcePath, fileMapping.dest);
                                });
                            });
                        }
                    }));
            })
            .then(function () {
                // Then copy them to the appropriate directory.
                done();
            })
            .catch(function (err) {
                cancelTask('Error installing plugins', err);
            });

        // Install plugins into the build directory

        // Install the plugin config into the build
    }
    grunt.registerTask('install-external-plugins',
        'Copy plugins from bower into their appropriate locations',
        installExternalPlugins);


    function enterBuilding() {
        grunt.file.setBase('building');
    }
    grunt.registerTask('enter-building', 'Enter the building dir', enterBuilding);

    function leaveBuilding() {
        grunt.file.setBase('..');
    }
    grunt.registerTask('leave-building', 'Leave the building dir', leaveBuilding);


    // Load External Tasks
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-regex-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-http-server');
    //grunt.loadNpmTasks('grunt-markdown');

    /* 
     * This section sets up a mapping for bower packages.
     * Believe it or not this is shorter and easier to maintain 
     * than plain grunt-contrib-copy
     * 
     */
    var bowerPackages = [
        {
            name: 'bluebird',
            cwd: 'js/browser',
            src: ['bluebird.js']
        },
        {
            name: 'bootstrap',
            cwd: 'dist',
            src: '**/*'
        },
        {
            name: 'd3'
        },
        {
            name: 'font-awesome',
            src: ['css/font-awesome.css', 'fonts/*']
        },
        {
            name: 'jquery',
            cwd: 'dist',
            src: ['jquery.js']
        },
        {
            name: 'js-yaml',
            cwd: 'dist'
        },
        {
            dir: 'node-uuid',
            src: ['uuid.js']
        },
        {
            name: 'require-css',
            src: ['css.js', 'css-builder.js', 'normalize.js']
        },
        {
            dir: 'require-yaml',
            name: 'yaml'
        },
        {
            dir: 'requirejs',
            name: 'require'
        },
        {
            dir: 'requirejs-domready',
            name: 'domReady'
        },
        {
            dir: 'requirejs-json',
            name: 'json'
        },
        {
            dir: 'requirejs-text',
            name: 'text'
        },
        {
            dir: 'SparkMD5',
            name: 'spark-md5'
        },
        {
            name: 'underscore'
        },
        {
            name: 'datatables',
            cwd: 'media',
            src: ['css/jquery.dataTables.css', 'images/*', 'js/jquery.dataTables.js']
        },
        {
            name: 'datatables-bootstrap3',
            dir: 'datatables-bootstrap3-plugin',
            cwd: 'media',
            src: ['css/datatables-bootstrap3.css', 'js/datatables-bootstrap3.js']
        },
        {
            name: 'google-code-prettify',
            dir: 'google-code-prettify',
            cwd: 'src',
            src: ['prettify.js', 'prettify.css']
        },
        {
            dir: 'd3-plugins-sankey',
            src: ['sankey.js', 'sankey.css']
        },
        {
            name: 'handlebars'
        },
        {
            name: 'nunjucks',
            cwd: 'browser',
            src: 'nunjucks.js'
        },
        {
            dir: 'numeral',
            src: ['numeral.js', 'languages/*.js']
        },
        // KBase Packages
        // These adhere to the new package-directory format. 
        {
            name: 'kbase-ui-widget',
            cwd: 'src',
            src: ['**/*'],
            dest: ''
        },
        {
            name: 'kbase-common-js',
            cwd: 'dist',
            src: ['**/*'],
            dest: ''
        },
        {
            name: 'kbase-service-clients-js',
            cwd: 'dist',
            src: ['**/*'],
            dest: ''
        },
        // Dependencies needed for Search (for now)
        {
            name: 'blockUI',
            src: ['jquery.blockUI.js']
        },
        {
            name: 'q',
            src: ['q.js']
        }
    ], bowerPlugins = [
        // PLUGINS
        // Note that they all have a dest property which places them into a 
        // specific directory
        {
            name: 'kbase-ui-plugin-datawidgets',
            dest: 'plugins/datawidgets'
        },
        {
            name: 'kbase-ui-plugin-databrowser',
            dest: 'plugins/databrowser'
        },
        {
            name: 'kbase-ui-plugin-typebrowser',
            dest: 'plugins/typebrowser'
        },
        {
            name: 'kbase-ui-plugin-dataview',
            dest: 'plugins/dataview'
        },
        {
            name: 'kbase-ui-plugin-typeview',
            dest: 'plugins/typeview'
        },
        {
            name: 'kbase-ui-plugin-dashboard',
            dest: 'plugins/dashboard'
        },
        {
            name: 'kbase-ui-plugin-vis-widgets',
            dest: 'plugins/viswidgets'
        },
        {
            name: 'kbase-service-clients-js',
            cwd: 'dist/plugin',
            dest: 'plugins/serviceclients'
        },
        {
            name: 'kbase-ui-plugin-demo-vis-widget',
            dest: 'plugins/viswidgetdemo'
        }
    ];

    function bowerCopy(bowerFiles, defaults) {
        defaults = defaults || {};
        return bowerFiles.map(function (cfg) {
            // path is like dir/path/name
            var filePaths = [];
            // dir either dir or name is the first level directory.
            // path.unshift(cfg.dir || cfg.name);

            // If there is a path (subdir) we add that too.
            if (cfg.path) {
                filePaths.unshift(cfg.path);
            }

            // Until we get a path which we use as a prefix to the src.
            var pathString = filePaths
                .filter(function (el) {
                    if (el === null || el === undefined || el === '') {
                        return false;
                    }
                    return true;
                })
                .join('/');

            var srcs = (function () {
                var src = cfg.src || defaults.src;
                if (src === undefined) {
                    return [cfg.name + '.js'];
                } else {
                    if (typeof src === 'string') {
                        return [src];
                    } else {
                        return src;
                    }
                }
            }());

            var sources = srcs.map(function (s) {
                return [pathString, s]
                    .filter(function (el) {
                        if (el === null || el === undefined || el === '') {
                            return false;
                        }
                        return true;
                    })
                    .join('/');
            });

            var cwd = cfg.cwd || defaults.cwd;
            if (cwd && cwd.charAt(0) === '/') {
                // ignore and move on
            } else {
                cwd = 'bower_components/' + (cfg.dir || cfg.name) + (cwd ? '/' + cwd : '');
            }
            var dest;
            if (typeof cfg.dest === 'string') {
                dest = buildDir('client/modules/' + cfg.dest);
            } else {
                dest = buildDir('client/modules/bower_components') + '/' + (cfg.dir || cfg.name);
            }
            return {
                nonull: true,
                expand: true,
                cwd: cwd,
                src: sources,
                dest: dest
            };
        });
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            bower: {
                files: bowerCopy(bowerPackages)
            },
            plugins: {
                files: bowerCopy(bowerPlugins, {
                    cwd: 'src/plugin',
                    src: ['**/*']
                })
            },
            build: {
                files: [
                    {
                        cwd: 'src/client',
                        src: '**/*',
                        dest: buildDir('client'),
                        expand: true
                    },
                    {
                        cwd: 'src/data',
                        src: '**/*',
                        dest: buildDir('client/data'),
                        expand: true
                    }
                ]
            },
            building: {
                files: [
                    {
                        cwd: 'src/client',
                        src: '**/*',
                        dest: buildingDir('build/client'),
                        expand: true
                    },
                    {
                        cwd: 'src/data',
                        src: '**/*',
                        dest: buildingDir('build/client/data'),
                        expand: true
                    },
                    {
                        cwd: 'targets/' + getTaskState('target'),
                        src: 'menu.yml',
                        dest: buildingDir('build/client/modules/config'),
                        expand: true
                    }
                ]
            },
            dist: {
                files: [
                    {
                        cwd: 'build',
                        src: '**',
                        dest: 'dist',
                        expand: true
                    }
                ]
            },
            'building-to-build': {
                files: [
                    {
                        cwd: 'building/build',
                        src: '**/*',
                        dest: 'build',
                        expand: true
                    }
                ]
            },
            dev: {
                files: [
// Uncomment to have these built into kbase-ui directly from a local repo.
// plugins as defined in ui-test.yml also need to be adjusted.


//                    {
//                        cwd: makeRepoDir('kbase-ui-plugin-dataview/src/plugin'),
//                        src: '**/*',
//                        dest: buildDir('client/modules/plugins/dataview'),
//                        expand: true
//                    },
//                    {
//                        cwd: makeRepoDir('kbase-ui-plugin-typebrowser/src/plugin'),
//                        src: '**/*',
//                        dest: buildDir('client/plugins/typebrowser'),
//                        expand: true
//                    },
//                    {
//                        cwd: makeRepoDir('kbase-ui-plugin-databrowser/src/plugin'),
//                        src: '**/*',
//                        dest: buildDir('client/plugins/databrowser'),
//                        expand: true
//                    }


//                    
//                    {
//                        cwd: makeRepoDir('kbase-ui-plugin-dashboard/src/plugin'),
//                        src: '**/*',
//                        dest: buildDir('client/plugins/dashboard'),
//                        expand: true
//                    }

                ]
            },
            deploy: {
                files: [
                    {
                        cwd: 'build/client',
                        src: '**/*',
                        dest: deployCfg['kbase-ui']['deploy_target'],
                        expand: true
                    }
                ]
            },
            config: {
                files: [
                    {
                        src: 'config/ui-' + uiTarget + '.yml',
                        dest: buildDir('client/modules/app/ui.yml')
                    }
                ]
            },
            'build-search': {
                files: [
                    {
                        cwd: 'src/search',
                        src: '**/*',
                        dest: 'build/client/search',
                        expand: true
                    }
                ]
            },
            'building-search': {
                files: [
                    {
                        cwd: 'src/search',
                        src: '**/*',
                        dest: 'building/build/client/search',
                        expand: true
                    }
                ]
            }
        },
        clean: {
            build: {
                src: [buildDir()]
            },
            building: {
                src: [buildingDir()]
            },
            dist: {
                src: ['dist']
            },
            detritus: {
                src: ['building/**/.DS_Store']
            }
        },
        mkdir: {
            building: {
                options: {
                    create: [buildingDir()]
                }
            }
        },
        connect: {
            build: {
                options: {
                    port: 8887,
                    base: 'build/client',
                    open: true,
                    keepalive: true,
                    onCreateServer: function (server, connect, options) {
                        console.log('created...');
                    }
                }
            },
            dist: {
                options: {
                    port: 8887,
                    base: 'dist/client',
                    open: true,
                    keepalive: true,
                    onCreateServer: function (server, connect, options) {
                        console.log('created...');
                    }
                }
            }
        },
        'http-server': {
            dev: {
                root: buildDir('client'),
                port: 8887,
                host: '0.0.0.0',
                autoIndex: true,
                runInBackground: true
            }
        },
        open: {
            dev: {
                path: 'http://localhost:8887'
            }
        },
        // Testing with Karma!
        karma: {
            unit: {
                configFile: 'test/karma.conf.js'
            },
            dev: {
                // to do - add watch here
                configFile: 'test/karma.conf.js',
                reporters: ['progress', 'coverage'],
                coverageReporter: {
                    dir: 'build/test-coverage/',
                    reporters: [
                        {type: 'html', subdir: 'html'}
                    ]
                },
                autoWatch: true,
                singleRun: false
            }
        },
        // Run coveralls and send the info.
        coveralls: {
            options: {
                force: true
            },
            'kbase-ui': {
                src: 'build/test-coverage/lcov/**/*.info'
            }
        },
        bower: {
            install: {
                options: {
                    copy: false
                }
            }
        },
        shell: {
            bowerUpdate: {
                command: [
                    'bower',
                    'update'
                ].join(' '),
                options: {
                    stderr: false
                }
            },
            bowerInstall: {
                command: [
                    'bower',
                    'install'
                ].join(' '),
                options: {
                    stderr: false
                }
            }
        },
        markdown: {
            build: {
                files: [
                    {
                        expand: true,
                        src: 'src/docs/**/*.md',
                        dest: buildDir('docs'),
                        ext: '.html'
                    }
                ],
                options: {
                }
            }
        },
        requirejs: {
            dist: {
                options: {
                    buildCSS: false,
                    baseUrl: 'dist/client/modules',
                    mainConfigFile: 'dist/client/modules/require-config.js',
                    findNestedDependencies: true,
                    optimize: 'uglify2',
                    generateSourceMaps: true,
                    preserveLicenseComments: false,
                    name: 'startup',
                    out: 'dist/client/modules/kbase-min.js',
                    exclude: ['yaml!config/config.yml'],
                    paths: {
                        'css-builder': 'bower_components/require-css/css-builder',
                        normalize: 'bower_components/require-css/normalize'
                    }
                }
            }
        },
        // Put a 'revision' stamp on the output file. This attaches an 8-character 
        // md5 hash to the end of the requirejs built file.
        filerev: {
            options: {
                algorithm: 'md5',
                length: 8
            },
            dist: {
                files: [{
                        src: [
                            'dist/client/modules/kbase-min.js'
                        ],
                        dest: 'dist/client/modules/'
                    }]
            }
        },
        // Once we have a revved file, this inserts that reference into page.html at
        // the right spot (near the top, the narrative_paths reference)
        'regex-replace': {
            dist: {
                src: ['dist/client/index.html'],
                actions: [
                    {
                        name: 'requirejs-onefile',
                        search: 'startup',
                        replace: function (match) {
                            // do a little sneakiness here. we just did the filerev thing, so get that mapping
                            // and return that (minus the .js on the end)
                            var revvedFile = grunt.filerev.summary['dist/client/modules/kbase-min.js'];
                            console.log('REVVED');
                            console.log(revvedFile);
                            // starts with 'static/' and ends with '.js' so return all but the first 7 and last 3 characters
                            return revvedFile.substr(20, revvedFile.length - 10);
                        },
                        flags: ''
                    }
                ]
            }
        },
        uglify: {
            dist: {
                files: [
                    {
                        cwd: 'dist/client',
                        src: '**/*.js',
                        dest: 'dist/client',
                        expand: true
                    }
                ]
            }
        }
    });

    grunt.registerTask('get-build-options',
        'Set build options from command line or environment',
        getBuildOptions);

    grunt.registerTask('build-config',
        'Build the config file',
        buildConfigFile);




    grunt.registerTask('install-plugins',
        'Install UI plugins',
        installPlugins);



    // Does the whole building task. Installs everything needed
    // from Bower, builds and optimizes things, and tweaks the 
    // distributable index.html to use the compiled product.
    grunt.registerTask('build-old', [
        'bower:install',
        'copy:bower',
        'copy:plugins',
        'copy:build',
        // 'install-plugins',
        'copy:dev',
        'copy:config',
        'copy:build-search',
        'build-config'
    ]);

    // new 'building' build process.
    // The point is the 'setup' phase - we need to prepare the base configuration for the build,
    // which can then be modified to introduce plugins, as well as a development environment,
    // and perhaps testing.
    grunt.registerTask('clean-building', [
        'clean:building'
    ]);
    grunt.registerTask('setup-building', [
        // 'load-target-config',
        'mkdir:building',
        'inject-plugins-into-bower',
        'building-config',
        'inject-plugins-into-config'
    ]);
    grunt.registerTask('make-building', [
        'copy:building',
        'enter-building',
        'bower:install',
        'copy:bower',
        'leave-building',
        'install-external-plugins',
        'copy:building-search',
        'clean:detritus'
    ]);
    grunt.registerTask('install-building', 'Finish the building', [
        'clean:build',
        'copy:building-to-build'
        
    ]);

    grunt.registerTask('build-building', [
        'setup-building', 
        'make-building', 
        'install-building'
    ]);

    grunt.registerTask('tinker', [
        'load-target-config',
        'tinker-report'
    ]);

    grunt.registerTask('dist', [
        'build',
        'requirejs',
        'filerev',
        'regex-replace'
    ]);

    grunt.registerTask('build-dist', [
        'clean:dist',
        'copy:dist',
        //'requirejs:dist',
        //'filerev:dist',
        //'regex-replace:dist',
        'uglify:dist'
    ]);


    grunt.registerTask('deploy', [
        'copy:deploy'
    ]);

    // Does a single, local, unit test run.
    grunt.registerTask('test', [
        'karma:unit'
    ]);

    // Does a single unit test run, then sends 
    // the lcov results to coveralls. Intended for running
    // from travis-ci.
    grunt.registerTask('test-travis', [
        'karma:unit',
        'coveralls'
    ]);

    // Does an ongoing test run in a watching development
    // mode.
    grunt.registerTask('develop', [
        'karma:dev'
    ]);

    // Starts a little server and runs the app in a page. 
    // Should be run after 'grunt build'.
    grunt.registerTask('preview-build', [
        'open',
        'connect:build'
    ]);
    
    grunt.registerTask('preview-dist', [
        // 'open',
        'connect:dist'
    ])


    /*
     * Main build tasks -- redirect to the real ones.
     */

//    grunt.registerTask('build', [
//        'build-building'
//    ]);
//    grunt.registerTask('clean', [
//        'clean-building'
//    ]);

};