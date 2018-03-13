/*global module*/

/**
 * Gruntfile for kbase-ui
 */

module.exports = function (grunt) {
    'use strict';

    // Load External Tasks
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-webdriver');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
       
        // Testing with Karma!
        // karma: {
        //     unit: {
        //         configFile: 'test/unit-tests/karma.conf.js'
        //     },
        //     dev: {
        //         // to do - add watch here
        //         configFile: 'test/unit-tests/karma.conf.js',
        //         reporters: ['progress', 'coverage'],
        //         coverageReporter: {
        //             dir: 'build/build-test-coverage/',
        //             reporters: [
        //                 { type: 'html', subdir: 'html' }
        //             ]
        //         },
        //         autoWatch: true,
        //         singleRun: false
        //     }
        // },

        // // Run coveralls and send the info.
        // coveralls: {
        //     options: {
        //         force: true
        //     },
        //     'kbase-ui': {
        //         src: 'build/build-test-coverage/lcov/**/*.info'
        //     }
        // },

        webdriver: {
            // note should be called with a base of build/tests/integration-tests
            integration: {
                configFile: './integration-tests/wdio.conf.local.js',
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


    // Does a single, local, unit test run.
    // TODO: more work on the webdriver tests, don't work now.
    // grunt.registerTask('unit-test', [
    //     'karma:unit'
    // ]);

    grunt.registerTask('integration-tests', [
        'webdriver:integration'
    ]);

    // Does a single unit test run, then sends 
    // the lcov results to coveralls. Intended for running
    // from travis-ci.
    // grunt.registerTask('test-travis', [
    //     // 'karma:unit',
    //     // upcoming
    //     // 'webdriver:travis',
    //     'coveralls'
    // ]);

};
