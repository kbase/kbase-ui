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
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-mkdir');
    
    function fixThrift1 (content) {
        var namespaceRe = /^if \(typeof ([^\s\+]+)/m,
            namespace = content.match(namespaceRe)[1],
            lintDecls = '/*global define */\n/*jslint white:true */',
            requireJsStart = 'define(["thrift"], function (Thrift) {\n"use strict";',
            requireJsEnd = 'return '+namespace+';\n});',
            fixDeclRe = /if \(typeof ([^\s]+) === 'undefined'\) {\n[\s]*([^\s]+) = {};\n}/,
            repairedContent = content
                .replace(fixDeclRe, 'var $1 = {};\n')
                .replace(/([^=!])==([^=])/g, '$1===$2')
                .replace(/!=([^=])/g, '!==$1');
            
        return [lintDecls, requireJsStart, repairedContent, requireJsEnd].join('\n');
    }
     function fixThrift2 (content) {
        var lintDecls = '/*global define */\n/*jslint white:true */',
            namespaceRe = /^([^\/\s\.]+)/m,
            namespace = content.match(namespaceRe)[1],
            requireJsStart = 'define(["thrift", "'+namespace+'_types"], function (Thrift, '+namespace+') {\n"use strict";',
            requireJsEnd = 'return '+namespace+';\n});',
            repairedContent = content
                .replace(/([^=!])==([^=])/g, '$1===$2')
                .replace(/!=([^=])/g, '!==$1');
            
        return [lintDecls, requireJsStart, repairedContent, requireJsEnd].join('\n');
    }

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
            dir: 'SparkMD5',
            name: 'spark-md5'
        },
        {
            name: 'underscore'
        },
        {
            name: 'kbase-ui-plugin-databrowser',
            cwd: 'src/plugin',
            src: ['**/*']
        },
        {
            name: 'kbase-ui-plugin-typeview',
            cwd: '/Users/erik/work/kbase/projects/Ease Dev Campaign/dev/repos/typeview/src/plugin',
            src: ['**/*']
        },
        
//        {
//            name: 'kbase-ui-plugin-typeview',
//            cwd: 'src/plugin',
//            src: ['**/*']
//        },
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
            if (cwd && cwd.charAt(0) === '/') {
            } else {
                cwd = 'bower_components/' + (cfg.dir || cfg.name) + (cwd ? '/' + cwd : '')
            }
            return {
                nonull: true,
                expand: true,
                cwd: cwd,
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
                    },
                    {
                        cwd: 'src/data',
                        src: '**/*',
                        dest: makeBuildDir('client/data'),
                        expand: true
                    },
                    {
                        src: 'src/config/ci.yml',
                        dest: makeBuildDir('client/config/client.yml')
                    },
                    {
                        src: 'lib/kbase-client-api.js',
                        dest: makeBuildDir('client'),
                        expand: true
                    }
                ]
            },
            taxonLib1: {
                files: [
                    {
                        cwd: 'temp/gen-js',
                        src: 'taxon_types.js',
                        dest: makeBuildDir('client/lib/thrift'),
                        expand: true
                    }
                ],
                options: {
                    process: function (content) {
                        return fixThrift1(content);
                    }
                }
            },
            taxonLib2: {
                files: [
                    {
                        cwd: 'temp/gen-js',
                        src: 'TaxonService.js',
                        dest: makeBuildDir('client/lib/thrift'),
                        expand: true
                    }
                ],
                options: {
                    process: function (content) {
                        return fixThrift2(content);
                    }
                }
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
            },
            temp: {
                src: 'temp'
            }
        },
        shell: {
            makeTaxonLib: {
                command: [
                    'thrift',
                    '-gen js:jquery',
                    '-o temp',
                    'bower_components/data-api/thrift/specs/taxonomy/taxon/taxon.thrift'
                ].join(' '),
                options: {
                    stderr: false
                }
            }
        },
        mkdir: {
            temp: {
                options: {
                    create: ['temp']
                }
            }
        }
    });

    grunt.registerTask('build', [
        'copy:bower',
        'copy:build',
        'build-thrift-libs'
    ]);

    grunt.registerTask('build-thrift-libs', [
        'clean:temp',
        'mkdir:temp',
        'shell:makeTaxonLib',
        'copy:taxonLib1',
        'copy:taxonLib2'
    ]);
};
