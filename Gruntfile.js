/*global module*/

/**
 * Gruntfile for kbase-ui
 */

module.exports = function (grunt) {
    'use strict';

    // Load External Tasks
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-webdriver');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
       
        // Testing with Karma!
        karma: {
            unit: {
                configFile: 'test/unit-tests/karma.conf.js'
            },
            dev: {
                // to do - add watch here
                configFile: 'test/unit-tests/karma.conf.js',
                reporters: ['progress', 'coverage'],
                coverageReporter: {
                    dir: 'build/build-test-coverage/',
                    reporters: [
                        { type: 'html', subdir: 'html' }
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
                src: 'build/build-test-coverage/lcov/**/*.info'
            }
        },

        clean: {
            build: {
                src: [
                    'build/build'
                ]
            },
            dist: {
                src: [
                    'build/dist'
                ]
            },
            test: {
                src: [
                    'build/build-test-coverage'
                ]
            },
            temp: {
                src: [
                    'build/temp'
                ]
            },
            deps: {
                src: [
                    'node_modules', 'bower_components'
                ]
            }
        },

        webdriver: {
            test: {
                configFile: './test/wdio.conf.js'
            },
            local: {
                configFile: './test/wdio.conf.local.js',
                baseUrl: 'https://' + grunt.option('host') + '.kbase.us'
            },
            sauce: {
                configFile: './test/wdio.conf.sauce.js'
            },
            travis: {
                configFile: './test/wdio.conf.travis.js'
            }
        }
    });

    grunt.registerTask('clean-all', [
        'clean:build', 'clean:dist', 'clean:test', 'clean:deps', 'clean:temp'
    ]);

    // Does a single, local, unit test run.
    // TODO: more work on the webdriver tests, don't work now.
    grunt.registerTask('unit-test', [
        'karma:unit'
    ]);

    grunt.registerTask('integration-tests', [
        'webdriver:local'
    ]);

    // Does a single unit test run, then sends 
    // the lcov results to coveralls. Intended for running
    // from travis-ci.
    grunt.registerTask('test-travis', [
        // 'karma:unit',
        // upcoming
        // 'webdriver:travis',
        'coveralls'
    ]);

};
