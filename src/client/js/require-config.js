(function (global) {
    // For dev this should be set at app load time or manually set
    // if the cache seems to be sticky (it may not be nessary to ALWAYS
    // bust the cache.)
    // For production we should use the commit hash or
    // semver

    const REQUIRE_WAIT_SECONDS = 60;

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
        waitSeconds: REQUIRE_WAIT_SECONDS,
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
            'ui-lib': 'node_modules/@kbase/ui-lib',
            md5: 'node_modules/spark-md5/spark-md5',
            preact: 'node_modules/preact/preact.umd',
            htm: 'node_modules/htm/htm.umd',
            text: 'node_modules/requirejs-text/text',
            uuid: 'node_modules/uuid/uuid.min',
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
                promise: 'bluebird'
            }
        }
    };
})(window);
