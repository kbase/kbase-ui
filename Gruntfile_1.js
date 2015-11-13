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
    execAsync = Promise.promisify(require('child_process').exec),
    bower = require('bower');

module.exports = function (grunt) {
    'use strict';

    // Here we switch to the deployment environment.
    // prod = production
    // ci = continuous integration
    var servicesTarget = 'prod',
        // set to 'test' for switching to dev menus, 'prod' for normal ones.
        uiTarget = 'test',
        BUILD_DIR = 'build',
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
                return Promise.all(config.plugins.external.map(function (plugin) {
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
                        })

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

    // Load External Tasks
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-connect');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-regex-replace');
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
            name: 'kbase-common-js',
            cwd: 'src/js',
            src: ['**/*']
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
//                    ,
//                    {
//                        src: 'lib/kbase-client-api.js',
//                        dest: buildDir('client'),
//                        expand: true
//                    }
                ]
            },
            dev: {
                files: [
// Uncomment to have these built into kbase-ui directly from a local repo.
// plugins as defined in ui-test.yml also need to be adjusted.


                    {
                        cwd: makeRepoDir('kbase-ui-plugin-dataview/src/plugin'),
                        src: '**/*',
                        dest: buildDir('client/modules/plugins/dataview'),
                        expand: true
                    },
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
        },
        clean: {
            build: {
                src: [buildDir()]
            }
        },
        connect: {
            server: {
                port: 8887,
                base: 'build/client',
                keepalive: false,
                onCreateServer: function (server, connect, options) {
                    console.log('created...');
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
            compile: {
                options: {
                    buildCSS: false,
                    baseUrl: 'build/client',
                    mainConfigFile: 'build/client/modules/app/require-config.js',
                    findNestedDependencies: true,
                    optimize: 'uglify2',
                    generateSourceMaps: true,
                    preserveLicenseComments: false,
                    name: 'kb_startup',
                    out: 'build/client/dist/kbase-min.js',
                    exclude: ['yaml!config.yml'],
                    paths: {
                        'css-builder': 'bower_components/require-css/css-builder',
                        normalize: 'bower_components/require-css/normalize',
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
            source: {
                files: [{
                        src: [
                            'build/client/dist/kbase-min.js',
                        ],
                        dest: 'build/client/dist/'
                    }]
            }
        },
        // Once we have a revved file, this inserts that reference into page.html at
        // the right spot (near the top, the narrative_paths reference)
        'regex-replace': {
            dist: {
                src: ['build/client/index.html'],
                actions: [
                    {
                        name: 'requirejs-onefile',
                        search: '/js/startup',
                        replace: function (match) {
                            // do a little sneakiness here. we just did the filerev thing, so get that mapping
                            // and return that (minus the .js on the end)
                            var revvedFile = grunt.filerev.summary['build/client/dist/kbase-min.js'];
                            // starts with 'static/' and ends with '.js' so return all but the first 7 and last 3 characters
                            return revvedFile.substr(12, revvedFile.length - 10);
                        },
                        flags: ''
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
    grunt.registerTask('build', [
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

    grunt.registerTask('dist', [
        'build',
        'requirejs',
        'filerev',
        'regex-replace'
    ]);

    grunt.registerTask('deploy', [
        'copy:deploy'
    ]);

    // Does a single, local, unit test run.
    grunt.registerTask('test', [
        'karma:unit',
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
        'karma:dev',
    ]);

    // Starts a little server and runs the app in a page. 
    // Should be run after 'grunt build'.
    grunt.registerTask('preview', [
        'open:dev',
        'connect'
    ]);

};
