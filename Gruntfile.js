/*global module*/

/**
 * Gruntfile for kbase-ui
 */

module.exports = function (grunt) {

    // Load External Tasks
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

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
                    'build/build-test-coverage',
                    'build/test'
                ]
            },
            temp: {
                src: [
                    'temp/files'
                ]
            },
            deps: {
                src: [
                    'node_modules'
                ]
            },
        }
    });

    grunt.registerTask('clean-all', [
        'clean:build', 'clean:dist', 'clean:test', 'clean:deps', 'clean:temp'
    ]);

    grunt.registerTask('clean-build', [
        'clean:build', 'clean:dist', 'clean:test', 'clean:temp'
    ]);
};
