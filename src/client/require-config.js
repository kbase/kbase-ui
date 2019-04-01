(function (global) {
    'use strict';
    // For dev this should be set at app load time or manually set
    // if the cache seems to be sticky (it may not be nessary to ALWAYS
    // bust the cache.)
    // For production we should use the commit hash or
    // semver
    var build = global.__kbase__build__;
    var buildKey;
    switch (build.target) {
    case 'dev':
        buildKey = new Date().getTime();
        break;
    case 'ci':
    case 'prod':
        buildKey = build.gitCommitHash;
        break;
    default:
        throw new Error('Unsupported build target: ' + build.target);
    }
    global.require = {
        baseUrl: '/modules',
        urlArgs: 'cb=' + buildKey,
        catchError: true,
        waitSeconds: 60,
        paths: {
            ajv: 'node_modules/ajv/ajv.bundle',
            bluebird: 'node_modules/bluebird/bluebird',
            bootstrap_css: 'bower_components/bootstrap/css/bootstrap',
            bootstrap: 'bower_components/bootstrap/js/bootstrap',
            css: 'bower_components/require-css/css',
            datatables_bootstrap_css: 'bower_components/datatables-bootstrap3-plugin/css/datatables-bootstrap3',
            datatables_bootstrap: 'bower_components/datatables-bootstrap3-plugin/js/datatables-bootstrap3',
            datatables_css: 'bower_components/datatables/css/jquery.dataTables',
            datatables: 'bower_components/datatables/js/jquery.dataTables',
            domReady: 'bower_components/requirejs-domready/domReady',
            'bootstrap-datetimepicker': 'bower_components/eonasdan-bootstrap-datetimepicker/bootstrap-datetimepicker',
            'bootstrap-datetimepicker-css':
                'bower_components/eonasdan-bootstrap-datetimepicker/bootstrap-datetimepicker',
            font_awesome: 'bower_components/font-awesome/css/font-awesome',
            handlebars: 'bower_components/handlebars/handlebars',
            highlight_css: 'bower_components/highlightjs/styles/tomorrow',
            'js-yaml': 'bower_components/js-yaml/js-yaml',
            jquery: 'bower_components/jquery/jquery',
            'jquery-ui': 'bower_components/jquery-ui/jquery-ui',
            json: 'bower_components/requirejs-json/json',
            kb_bootstrap: 'css/kb-bootstrap',
            kb_datatables: 'css/kb-datatables',
            kb_icons: 'css/kb-icons',
            kb_ui: 'css/kb-ui',
            knockout: 'bower_components/knockout/knockout',
            'knockout-arraytransforms': 'bower_components/knockout-arraytransforms/knockout-arraytransforms',
            'knockout-projections': 'bower_components/knockout-projections/knockout-projections',
            'knockout-switch-case': 'bower_components/knockout-switch-case/knockout-switch-case',
            'knockout-mapping': 'bower_components/bower-knockout-mapping/knockout.mapping',
            'knockout-validation': 'bower_components/knockout-validation/knockout.validation',
            marked: 'bower_components/marked/marked',
            md5: 'bower_components/spark-md5/spark-md5',
            moment: 'bower_components/moment/moment',
            numeral: 'bower_components/numeral/numeral',
            preact: 'node_modules/preact/preact.umd',
            text: 'bower_components/requirejs-text/text',
            uuid: 'bower_components/pure-uuid/uuid',
            yaml: 'bower_components/requirejs-yaml/yaml'
        },
        shim: {
            bootstrap: {
                deps: ['jquery', 'css!bootstrap_css']
            },
            'bootstrap-datetimepicker': {
                deps: ['bootstrap', 'css!bootstrap-datetimepicker-css']
            }
        },
        map: {
            '*': {
                promise: 'bluebird'
            }
        }
    };
})(window);
