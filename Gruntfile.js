/*global define */
/*jslint
 white: true, browser: true
 */

/**
 * Gruntfile for kbase-ui
 */
'use strict';
var path = require('path'),
    iniParser = require('node-ini'),
    fs = require('fs'),
    _ = require('lodash');

// Here we switch to the deployment environment.
// prod = production
// ci = continuous integration

//if (grunt.option('kb_deployment_config')) {
//           deployCfgFile = grunt.option('kb_deployment_config');
//       } else if (process.env.KB_DEPLOYMENT_CONFIG) {
//           deployCfgFile = process.env.KB_DEPLOYMENT_CONFIG;
//       }

/**
 * Cancels a task
 */
function cancelTask() {
    var message = Array.prototype.slice.call(arguments).map(function (message) {
        return String(message);
    }).join(' ');
    console.error(message);
    process.exit(1);
}

module.exports = function (grunt) {
    var servicesTarget = 'prod',
        // set to 'test' for switching to dev menus, 'prod' for normal ones.
        uiTarget = 'test';

    // Config
    // TODO: maybe read something from the runtime/config directory so we don't 
    // need to tweak this and accidentally check it in...
    var BUILD_DIR = 'build';

    function buildDir(subdir) {
        if (subdir) {
            return path.normalize(BUILD_DIR + '/' + subdir);
        }
        return path.normalize(BUILD_DIR);
    }

    var REPO_DIR = '..';

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
        'use strict';

        var serviceTemplateFile = 'config/service-config-template.yml',
            settingsCfg = 'config/settings.yml',
            outFile = buildDir('client/config.yml'),
            done = this.async();
        fs.readFile(serviceTemplateFile, 'utf8', function (err, serviceTemplate) {
            if (err) {
                console.log(err);
                throw 'Error reading service template';
            }

            var compiled = _.template(serviceTemplate),
                services = compiled(deployCfg['ui-common']);

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

    // Project configuration
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
    var bowerFiles = [
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
            name: 'lodash'
        },
        {
            dir: 'node-uuid',
            src: ['uuid.js']
        },
        {
            dir: 'postal.js',
            cwd: 'lib',
            name: 'postal'
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
            name: 'vega'
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

        // PLUGINS
        {
            name: 'kbase-ui-plugin-databrowser',
            cwd: 'src/plugin',
            src: ['**/*']
        },
        {
            name: 'kbase-ui-plugin-typebrowser',
            cwd: 'src/plugin',
            src: ['**/*']
        },
        {
            name: 'kbase-ui-plugin-dataview',
            cwd: 'src/plugin',
            src: ['**/*']
        },   

        {
            name: 'kbase-ui-plugin-typeview',
            cwd: 'src/plugin',
            src: ['**/*']
        },
        {
            name: 'kbase-ui-plugin-dashboard',
            cwd: 'src/plugin',
            src: ['**/*']
        },
        {
            name: 'kbase-ui-plugin-vis-widgets',
            cwd: 'src/plugin',
            src: ['**/*']
        },
        {
            dir: 'data-api',
            cwd: 'bower',
            src: '**/*'
        },
//        {
//            dir: 'kbase-data-api-js-wrappers',
//            cwd: 'bower',
//            src: '**/*'
//        },
        {
            dir: 'thrift-binary-protocol',
            cwd: 'src',
            src: '**/*'
        },
        {
            name: 'kbase-service-clients-js',
            cwd: 'dist/plugin',
            src: ['**/*']
        }

    ],
        bowerCopy = bowerFiles.map(function (cfg) {
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
                if (cfg.src === undefined) {
                    return [cfg.name + '.js'];
                } else {
                    if (typeof cfg.src === 'string') {
                        return [cfg.src];
                    } else {
                        return cfg.src;
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

            var cwd = cfg.cwd;
            if (cwd && cwd.charAt(0) === '/') {
                // ignore and move on
            } else {
                cwd = 'bower_components/' + (cfg.dir || cfg.name) + (cwd ? '/' + cwd : '');
            }
            return {
                nonull: true,
                expand: true,
                cwd: cwd,
                src: sources,
                dest: buildDir('client/bower_components') + '/' + (cfg.dir || cfg.name)
            };
        });

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            bower: {
                files: bowerCopy
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
                    },
                    //{
                    //    src: 'src/config/ci.yml',
                    //    dest: buildDir('client/config/client.yml')
                    //},
                    {
                        src: 'lib/kbase-client-api.js',
                        dest: buildDir('client'),
                        expand: true
                    }
                ]
            },
            dev: {
                files: [
                    {
                        cwd: makeRepoDir('kbase-ui-plugin-dataview/src/plugin'),
                        src: '**/*',
                        dest: buildDir('client/plugins/dataview'),
                        expand: true
                    },
//                    {
//                        cwd: makeRepoDir('kbase-ui-plugin-typebrowser/src/plugin'),
//                        src: '**/*',
//                        dest: buildDir('client/plugins/typebrowser'),
//                        expand: true
//                    },
//                    {
//                        cwd: makeRepoDir('dashboard/src/plugin'),
//                        src: '**/*',
//                        dest: buildDir('client/plugins/dashboard'),
//                        expand: true
//                    },
//                    {
//                        cwd: makeRepoDir('kbase-ui-plugin-databrowser/src/plugin'),
//                        src: '**/*',
//                        dest: buildDir('client/plugins/databrowser'),
//                        expand: true
//                    },
                ]
            },
            deploy: {
                files: [
                    {
                        cwd: 'build/client',
                        src: '**/*',
                        dest: deployCfg['ui-common']['deploy_target'],
                        expand: true
                    }
                ]
            },
            config: {
                files: [
                    {
                        src: 'config/ui-' + uiTarget + '.yml',
                        dest: buildDir('client/ui.yml')
                    }
                ]
            }
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
            'ui-common': {
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
                    baseUrl: "build/client",
                    mainConfigFile: "build/client/js/require-config.js",
                    findNestedDependencies: true,
                    optimize: "uglify2",
                    generateSourceMaps: true,
                    preserveLicenseComments: false,
                    name: "kb_startup",
                    out: "build/client/dist/kbase-min.js",
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
                        replace: function(match) {
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

    grunt.registerTask('get-build-options', 'Set build options from command line or environment', getBuildOptions);
    grunt.registerTask('build-config', 'Build the config file', buildConfigFile);

    // Does the whole building task. Installs everything needed
    // from Bower, builds and optimizes things, and tweaks the 
    // distributable index.html to use the compiled product.
    grunt.registerTask('build', [
        'bower:install',
        'copy:bower',
        'copy:build',
        'copy:config',
        'build-config',
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
