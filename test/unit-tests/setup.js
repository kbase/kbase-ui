// This bit will load all of the test spec files;
// The magic "__karma__.files" is set by karma from the unit-tests.conf.js
// file specs.
var tests = [];
var testFilesRe = /^\/base\/test\/unit-tests\/specs\/.*Spec\.js$/;
for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {
        if (testFilesRe.test(file)) {
            tests.push(file);
        }
    }
}

console.log('Loaded ' + tests.length + ' test specs.');

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/build/build/client/modules',
    // NOTE: this needs to be synced from src/require-config.js
    // TODO: bring these in programmatically
    paths: {
        bluebird: 'node_modules/bluebird/bluebird',
        bootstrap_css: 'bower_components/bootstrap/css/bootstrap',
        bootstrap: 'bower_components/bootstrap/js/bootstrap',
        css: 'bower_components/require-css/css',
        domReady: 'bower_components/requirejs-domready/domReady',
        font_awesome: 'bower_components/font-awesome/css/font-awesome',
        'js-yaml': 'bower_components/js-yaml/js-yaml',
        jquery: 'bower_components/jquery/jquery',
        json: 'bower_components/requirejs-json/json',
        kb_bootstrap: 'css/kb-bootstrap',
        kb_ui: 'css/kb-ui',
        md5: 'bower_components/spark-md5/spark-md5',
        numeral: 'bower_components/numeral/numeral',
        preact: 'node_modules/preact/preact.umd',
        htm: 'node_modules/htm/htm.umd',
        text: 'bower_components/requirejs-text/text',
        uuid: 'bower_components/pure-uuid/uuid',
        yaml: 'bower_components/requirejs-yaml/yaml',
        semver: 'node_modules/semver-umd/semver-umd' 
    },
    shim: {
        bootstrap: {
            deps: ['jquery', 'css!bootstrap_css']
        },
    },
    map: {
        '*': {
            // 'css': 'bower_components/require-css/css',
            'promise': 'bluebird'
        }
    },
    // ask Require.js to load these files (all our tests)
    deps: tests,
    // start test run, once Require.js is done
    callback: window.__karma__.start
});
