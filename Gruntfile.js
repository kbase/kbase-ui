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

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            testfiles: {
                files: [
                    {
                        cwd: 'test',
                        src: '**/*',
                        dest: 'dev/test',
                        expand: true
                    }
                ]
            }
        },
        // Testing with Karma!
        karma: {
            unit: {
                configFile: 'dev/test/karma.conf.js'
            },
            dev: {
                // to do - add watch here
                configFile: 'dev/test/karma.conf.js',
                reporters: ['progress', 'coverage'],
                coverageReporter: {
                    dir: 'dev/build/test-coverage/',
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
    
    grunt.registerTask('init', [
        'copy:testfiles'
    ]);

};