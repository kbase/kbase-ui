(function (global) {
    'use strict';
    // For dev this should be set at app load time or manually set
    // if the cache seems to be sticky (it may not be nessary to ALWAYS
    // bust the cache.)
    // For production we should use the commit hash or
    // semver

    function cacheBusterKey(buildInfo, developMode) {
        // NB developMode not implemented yet, so always defaults
        // to the gitCommitHash
        if (developMode) {
            return String(new Date().getTime());
        } else {
            return buildInfo.gitCommitHash;
        }
    }

    global.require = {
        baseUrl: '/modules',
        urlArgs: 'cb=' + cacheBusterKey(global.__kbase__build__, false),
        catchError: true,
        waitSeconds: 60,
        paths: {
            bluebird: 'node_modules/bluebird/bluebird',
            bootstrap_css: 'bower_components/bootstrap/css/bootstrap',
            bootstrap: 'bower_components/bootstrap/js/bootstrap',
            css: 'bower_components/require-css/css',
            datatables_bootstrap_css: 'bower_components/datatables-bootstrap3-plugin/css/datatables-bootstrap3',
            datatables_bootstrap: 'bower_components/datatables-bootstrap3-plugin/js/datatables-bootstrap3',
            datatables_css: 'bower_components/datatables/css/jquery.dataTables',
            datatables: 'bower_components/datatables/js/jquery.dataTables',
            domReady: 'bower_components/requirejs-domready/domReady',
            font_awesome: 'bower_components/font-awesome/css/font-awesome',
            highlight_css: 'bower_components/highlightjs/styles/tomorrow',
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
                promise: 'bluebird'
            }
        }
    };
})(window);
