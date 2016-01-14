// Karma configuration
// Generated on Thu Jul 30 2015 17:38:26 GMT-0700 (PDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../../',
    

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'requirejs'],

    // list of Karma plugins to use
    // This is someone redundant with what's in package.json,
    // but I like it to be explicit here.
    plugins: [
        'karma-jasmine',
        'karma-phantomjs-launcher',
        'karma-chrome-launcher',
        'karma-firefox-launcher',
        'karma-coverage',
        'karma-requirejs',
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
      {pattern: 'build/client/bower_components/jquery/dist/jquery.js', included: false},
      {pattern: 'build/client/bower_components/q/q.js', included: false},
      {pattern: 'build/client/bower_components/underscore/underscore.js', included: false},
      {pattern: 'build/client/bower_components/jquery-ui/jquery-ui.js', included: false},
      {pattern: 'build/client/bower_components/jquery-ui/themes/ui-lightness/jquery-ui.css', included: false},
      {pattern: 'build/client/bower_components/bootstrap/dist/js/bootstrap.js', included: false},
      {pattern: 'build/client/bower_components/bootstrap/dist/css/bootstrap.css', included: false},
      {pattern: 'build/client/bower_components/nunjucks/browser/nunjucks.js', included: false},
      {pattern: 'build/client/bower_components/spark-md5/spark-md5.js', included: false},
      {pattern: 'build/client/bower_components/lodash/lodash.js', included: false},
      {pattern: 'build/client/bower_components/postal.js/lib/postal.js', included: false},
      {pattern: 'build/client/bower_components/datatables/media/js/jquery.dataTables.js', included: false},
      {pattern: 'build/client/bower_components/datatables/media/css/jquery.dataTables.css', included: false},
      {pattern: 'build/client/bower_components/datatables-bootstrap3-plugin/media/js/datatables-bootstrap3.js', included: false},
      {pattern: 'build/client/bower_components/datatables-bootstrap3-plugin/media/css/datatables-bootstrap3.css', included: false},
      {pattern: 'build/client/bower_components/knockout/dist/knockout.js', included: false},
      {pattern: 'build/client/bower_components/knockout-mapping/knockout.mapping.js', included: false},
      {pattern: 'build/client/bower_components/blockUI/jquery.blockUI.js', included: false},
      {pattern: 'build/client/bower_components/d3/d3.js', included: false},
      {pattern: 'build/client/bower_components/d3-plugins-sankey/sankey.js', included: false},
      {pattern: 'build/client/bower_components/d3-plugins-sankey/sankey.css', included: false},
      {pattern: 'build/client/js/lib/etc/jquery-svg-graph-stacked-area.js', included: false},
      {pattern: 'build/client/bower_components/node-uuid/uuid.js', included: false},
      {pattern: 'build/client/lib/canvastext.js', included: false}, 
      {pattern: 'build/client/lib/popit.js', included: false},
      {pattern: 'build/client/lib/knhx.js', included: false},
      {pattern: 'build/client/lib/googlepalette.js', included: false},
      {pattern: 'build/client/bower_components/google-code-prettify/bin/prettify.min.js', included: false},
      {pattern: 'build/client/bower_components/google-code-prettify/bin/prettify.min.css', included: false},
      {pattern: 'build/client/bower_components/font-awesome/css/font-awesome.css', included: false},
      {pattern: 'build/client/bower_components/stacktrace-js/dist/stacktrace.js', included: false},
      {pattern: 'build/client/bower_components/handlebars/handlebars.amd.js', included: false},


      {pattern: 'build/client/bower_components/requirejs-text/text.js', included: false},
      {pattern: 'build/client/bower_components/requirejs-json/json.js', included: false},
      {pattern: 'build/client/bower_components/require-yaml/yaml.js', included: false},
      {pattern: 'build/client/bower_components/js-yaml/dist/js-yaml.js', included: false},
      {pattern: 'build/client/*.yml', included: false},
      {pattern: 'build/client/js/require-config.js', served: true, included: true},


      {pattern: 'build/client/js/**/*.js', included: false},
      {pattern: 'test/spec/**/*.js', included: false},

      'test/dev/test-main.js',
    ],


    // list of files to exclude
    exclude: [
      '**/*.swp'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/**/!(datavis|Tiling_widget|postal.request-response.q).js': ['coverage']
    },

    coverageReporter: {
      dir: 'build/test-coverage/',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'lcov', subdir: 'lcov' }
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
    // browsers: ['PhantomJS', 'Chrome', 'Firefox'],
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  })
}
