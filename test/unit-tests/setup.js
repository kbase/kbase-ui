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
        bootstrap_css: 'node_modules/bootstrap/css/bootstrap',
        bootstrap: 'node_modules/bootstrap/js/bootstrap',
        css: 'node_modules/require-css/css',
        domReady: 'node_modules/requirejs-domready/domReady',
        font_awesome: 'node_modules/font-awesome/css/font-awesome',
        'js-yaml': 'node_modules/js-yaml/js-yaml',
        jquery: 'node_modules/jquery/jquery',
        json: 'node_modules/requirejs-json/json',
        kb_bootstrap: 'css/kb-bootstrap',
        kb_lib: 'node_modules/@kbase/common-es6',
        kb_ui: 'css/kb-ui',
        md5: 'node_modules/spark-md5/spark-md5',
        preact: 'node_modules/preact/preact.umd',
        htm: 'node_modules/htm/htm.umd',
        text: 'node_modules/requirejs-text/text',
        uuid: 'node_modules/pure-uuid/uuid',
        yaml: 'ports/requirejs-yaml/yaml',
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
