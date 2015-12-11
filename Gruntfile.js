/*global define*/
/*jslint white:true*/

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
    var BUILD_DIR = 'build',
        BUILDING_DIR = 'building',
        REPO_DIR = '..';


    // UTILITIES

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
        
    function readYaml(file) {
        var content = fs.readFileSync(file, 'utf8');
        return yaml.safeLoad(content);
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

  


    // Manage state across tasks
    var STATE = {};
    function setTaskState(name, value) {
        STATE[name] = value;
    }
    function getTaskState(name, defaultValue) {
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

    // Manage the target configuration.
    // A target is just a simple string, prod or dev, which is associated
    // with a directory in /targets, which contains config files.
    // The target may be supplied on the command line as --target <target>
    // or in the grunt-args.yml file in the "target" property.
    function loadTargetConfig() {
        var target = grunt.option('target');
        if (!target) {
            var config = readYaml('grunt-args.yml');
            if (config) {
                target = config.target;
            }
        }

        if (!target) {
            throw new Error('Target not defined');
        }

        console.log('Loading target config "' + target + '"');

        setTaskState('target', target);

        // Load the deployment config
        var deployConfigPath = 'targets/' + target + '/deploy.yml';

        var targetConfig = readYaml(deployConfigPath);

        setTaskState('targetConfig', targetConfig);
        
        // KBase deploy config.
        var deployCfgFile = 'deploy-' + targetConfig.serviceTargetKey + '.cfg';
        var deployCfg = iniParser.parseSync(deployCfgFile);
        
        setTaskState('deployConfig', deployCfg);
    }
    loadTargetConfig();
    
    
    
    var buildType;
    function setBuildType() {
        buildType = grunt.option('type');
        if (!buildType) {
            var config = readYaml('grunt-args.yml');
            if (config) {
                buildType = config.type;
            }
        }

        if (!buildType) {
            throw new Error('Build type not defined');
        }

        console.log('Build type set to "' + buildType + '"');

        setTaskState('buildType', buildType);
    }
    setBuildType();


    // Allow a task to insist on a given target. Necessary for somethlinke 
    // like build-dist which should only run under the prod target.
    function targetTask() {
        // Pure coincidence that the target property is also the name of our
        // build target property.
        var currentTarget = getTaskState('target');
        if (currentTarget !== this.data.name) {
            cancelTask('A task requires the target "' + this.data.name + '", but the current target is "' + currentTarget +'"');
        }
       
    }
    grunt.registerMultiTask('target', 'Check the current target, regardless of command line or config', targetTask);

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
            servicesConfig = compiled(getTaskState('deployConfig')['kbase-ui']),
            concatenatedConfig = servicesConfig + '\n\n' + settings;

        grunt.file.write(outFile, concatenatedConfig);
    }
    grunt.registerTask('building-config',
        'Build the config file',
        buildingConfigFile);

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
                    } 
                    return pluginItem.name;
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
            deploy: {
                files: [
                    {
                        cwd: 'dist/client',
                        src: '**/*',
                        dest: getTaskState('deployConfig')['kbase-ui']['deploy_target'],
                        expand: true
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
        },
        target: {
            prod: {
                name: 'prod'
            },
            dev: {
                name: 'dev'
            }
        }
    });

    // new 'building' build process.
    // The point is the 'setup' phase - we need to prepare the base configuration for the build,
    // which can then be modified to introduce plugins, as well as a development environment,
    // and perhaps testing.
    grunt.registerTask('clean-build', [
        'clean:building',
        'clean:build'
    ]);

    grunt.registerTask('setup-building', [
        // 'load-target-config',
        'mkdir:building',
        'inject-plugins-into-bower',
        'building-config',
        'inject-plugins-into-config'
    ]);

    grunt.registerTask('construct-building', [
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
    
    grunt.registerTask('build-build', [
        'setup-building', 
        'construct-building', 
        'install-building'
    ]);
    
    grunt.registerTask('clean-dist', [
        'clean:dist',
        'clean:build',
        'clean:building'
    ])

    // Build the Distribution Package, forced to the prod target. 
    grunt.registerTask('build-dist', [
        // 'target:prod',
        'clean-build',
        'build-build',
        'clean:dist',
        'copy:dist',
        'requirejs:dist',
        'filerev:dist',
        'regex-replace:dist',
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
    ]);
};