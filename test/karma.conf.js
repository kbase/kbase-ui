// Karma configuration
// Generated on Thu Jul 30 2015 17:38:26 GMT-0700 (PDT)

module.exports = function (config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '..',
        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'requirejs'],
        // list of Karma plugins to use
        // This is someone redundant with what's in package.json,
        // but I like it to be explicit here.
        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-phantomjs-launcher',
            'karma-coverage',
            'karma-requirejs'
        ],
        // list of files / patterns to load in the browser
        files: [
            // had to add these all by hand, or Karma goes bugnuts.
            /* These are the external dependencies. The bower components
             * come with a LOT of stuff that isn't necessary, and causes
             * problems when loaded in the test browser. Things like tests,
             * or auto-generated minified AND maxified files that overlap.
             * 
             * It's cleaner to just load the list of them by hand, then
             * have the Require apparatus take over.
             */
            
            {pattern: 'build/client/modules/**/*.js', included: false},
            // {pattern: 'build/client/bower_components/**/*.js', included: false},
            {pattern: 'test/spec/**/*.js', included: false},
            {pattern: 'build/client/modules/config/*.yml', included: false},
            'test/main-test.js',
        ],
        // list of files to exclude
        exclude: [
            '**/*.swp'
        ],
        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
          'dev/build/client/!(bower_components)/**/*.js': ['coverage']
        },

        coverageReporter: {
            dir: 'build/test-coverage/',
            reporters: [
                {type: 'html', subdir: 'html'},
                {type: 'lcov', subdir: 'lcov'}
            ]
        },
        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],
        // web server port
        port: 9876,
        // enable / disable colors in the output (reporters and logs)
        colors: true,
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,
        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    })
}
