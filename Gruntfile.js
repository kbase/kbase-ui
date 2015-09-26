/*global require, module */
/*jslint white: true */
var path = require('path');
var fs = require('fs');
module.exports = function (grunt) {
    'use strict';

    // The runtime directory holds a build and dist directory and other files
    // required to actually run the build client and server.
    var runtimeDir = 'runtime';

    // The build directory is the destination for the KBase source, messaged
    // external dependencies, and other files needed to run the client and server
    // components. The build directory can be used directly in development mode,
    // since it contains normal, un-minified javascript.
    var buildDir = runtimeDir + '/build';

    var distDir = runtimeDir + '/dist';

    var testDir = runtimeDir + '/test';

    function makeBuildDir(subdir) {
        if (subdir) {
            return path.normalize(buildDir + '/' + subdir);
        }
        return path.normalize(buildDir);
    }

    // Load grunt npm tasks..
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Bower magic.
    /* 
     * This section sets up a mapping for bower packages.
     * Believe it or not this is shorter and easier to maintain 
     * than plain grunt-contrib-copy.
     * NB: please keep this list in alpha order by dir and then name.
     * 
     */
    var bowerFiles = [
        {
            name: 'bluebird',
            cwd: 'js/browser',
            src: ['bluebird.js'],
        },
        {
            name: 'bootstrap',
            cwd: 'dist',
            src: '**/*',
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
            src: ['jquery.js'],
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
            dir: 'postal.js',
            cwd: 'lib',
            name: 'postal'
        },
        {
            name: 'require-css',
            src: 'css.js'
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
            name: 'underscore'
        }

    ],
        bowerCopy = bowerFiles.map(function (cfg) {
            // path is like dir/path/name
            var path = [];
            // dir either dir or name is the first level directory.
            // path.unshift(cfg.dir || cfg.name);

            // If there is a path (subdir) we add that too.
            if (cfg.path) {
                path.unshift(cfg.path);
            }

            // Until we get a path which we use as a prefix to the src.
            var pathString = path
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
            return {
                nonull: true,
                expand: true,
                cwd: 'bower_components/' + (cfg.dir || cfg.name) + (cwd ? '/' + cwd : ''),
                src: sources,
                dest: makeBuildDir('client/bower_components') + '/' + (cfg.dir || cfg.name)
            };
        });


    // Project configuration.
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
                        dest: makeBuildDir('client'),
                        expand: true
                    }
                ]
            }                        
        },
        clean: {
            build: {
                src: [makeBuildDir()],
                // We force, because our build directory may be up a level 
                // in the runtime directory.
                options: {
                    force: true
                }
            }
        },
    });

    grunt.registerTask('build', [
        'copy:bower',
        'copy:build'
    ]);
};
