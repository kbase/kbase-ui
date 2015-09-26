/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
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
    
    function buildDir(subdir) {
        if (subdir) {
            return path.normalize(BUILD_DIR + '/' + subdir);
        }
        return path.normalize(BUILD_DIR);
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
            src: ['js/browser/bluebird.js']
        },
        {
            name: 'bootstrap',
            src: 'dist/**/*'
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
            src: ['dist/jquery.js']
        },
        {
            name: 'js-yaml',
            path: 'dist'
        },
        {
            name: 'kbase-common-js',
            src: ['js/**/*']
        },
        {
            name: 'lodash'
        },
        {
            dir: 'postal.js',
            path: 'lib',
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

            var srcs;
            if (cfg.src === undefined) {
                srcs = [cfg.name + '.js'];
            } else {
                if (typeof cfg.src === 'string') {
                    srcs = [cfg.src];
                } else {
                    srcs = cfg.src;
                }
            }

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

            var cd = cfg.cd;
            var entry = {
                nonull: true,
                expand: true,
                cwd: 'bower_components/' + (cfg.dir || cfg.name) + (cd ? '/' + cd : ''),
                src: sources,
                dest: buildDir('client/bower_components') + '/' + (cfg.dir || cfg.name)
            };
            // console.log(entry);
            return entry;
        });

    
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
             bower: {
                files: bowerCopy
            }
        }, 
        clean: {
            build: {
                src: [buildDir()],
                // We force, because our build directory may be up a level 
                // in the runtime directory.
                options: {
                    force: true
                }
            }
        },
    });
    
    grunt.registerTask('build', [
        'copy:bower'
    ]);
};
