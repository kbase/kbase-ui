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
            csv: 'lib/requirejs-csv',
            d3_sankey_css: 'bower_components/d3-plugins-sankey/sankey',
            d3_sankey: 'bower_components/d3-plugins-sankey/sankey',
            d3: 'bower_components/d3/d3',
            //  d3: 'node_modules/d3/d3',
            // 'd3-sankey': 'node_modules/d3-sankey/d3-sankey',
            // 'd3-collection': 'node_modules/d3-collection/d3-collection',
            // 'd3-shape': 'node_modules/d3-shape/d3-shape',
            // 'd3-array': 'node_modules/d3-array/d3-array',
            // 'd3-path': 'node_modules/d3-path/d3-path',

            dagre: 'node_modules/dagre/dagre',
            datatables_bootstrap_css: 'bower_components/datatables-bootstrap3-plugin/css/datatables-bootstrap3',
            datatables_bootstrap: 'bower_components/datatables-bootstrap3-plugin/js/datatables-bootstrap3',
            datatables_css: 'bower_components/datatables/css/jquery.dataTables',
            datatables: 'bower_components/datatables/js/jquery.dataTables',
            domReady: 'bower_components/requirejs-domready/domReady',
            'bootstrap-datetimepicker'    : 'bower_components/eonasdan-bootstrap-datetimepicker/bootstrap-datetimepicker',
            'bootstrap-datetimepicker-css': 'bower_components/eonasdan-bootstrap-datetimepicker/bootstrap-datetimepicker',
            fileSaver: 'bower_components/file-saver/FileSaver',
            font_awesome: 'bower_components/font-awesome/css/font-awesome',
            'google-code-prettify-style': 'bower_components/google-code-prettify/prettify',
            'google-code-prettify': 'bower_components/google-code-prettify/prettify',
            handlebars: 'bower_components/handlebars/handlebars',
            highlight_css: 'bower_components/highlightjs/styles/tomorrow',
            highlight: 'bower_components/highlightjs/highlight.pack',
            'jquery-svg': 'bower_components/jquery.svg/jquery.svg',
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
            'knockout-plus': 'lib/knockout-plus',
            'knockout-validation': 'bower_components/knockout-validation/knockout.validation',
            knack: 'kb_kb/lib/knockout-base',
            lodash: 'node_modules/lodash/lodash',
            marked: 'bower_components/marked/marked',
            md5: 'bower_components/spark-md5/spark-md5',
            moment: 'bower_components/moment/moment',
            numeral: 'bower_components/numeral/numeral',
            nunjucks: 'bower_components/nunjucks/nunjucks',
            plotly: 'bower_components/plotly.js/plotly',
            select2: 'bower_components/select2/js/select2.full',
            select2_css: 'bower_components/select2/css/select2',
            select2_bootstrap_theme: 'bower_components/select2-bootstrap-theme/select2-bootstrap',
            text: 'bower_components/requirejs-text/text',
            underscore: 'bower_components/underscore/underscore',
            uuid: 'bower_components/pure-uuid/uuid',
            vega: 'node_modules/vega/vega',
            yaml: 'bower_components/requirejs-yaml/yaml'
        },
        shim: {
            bootstrap: {
                deps: ['jquery', 'css!bootstrap_css']
            },
            'bootstrap-datetimepicker': {
                deps: ['bootstrap', 'css!bootstrap-datetimepicker-css']
            },
            'google-code-prettify': {
                deps: ['css!google-code-prettify-style']
            },
            d3_sankey: {
                deps: ['d3', 'css!d3_sankey_css']
                // deps: ['d3', 'css!d3_sankey_css', 'css!kb/style/sankey']
            },
            highlight: {
                deps: ['css!highlight_css']
            },
            'knockout-plus': {
                deps: ['knockout']
            },
            select2: {
                deps: ['css!select2_css', 'css!select2_bootstrap_theme']
            }
            // Activate this if using js-yaml with a need for these modules.
            // At the moment, requirejs global handler catches errors loading
            // this within js-yaml and allows js-yaml to detect that they are
            // absent.
            // 'js-yaml': {
            //     deps: ['esprima', 'buffer']
            // }
        },
        map: {
            '*': {
                // 'css': 'bower_components/require-css/css',
                'promise': 'bluebird'
            }
        }
    };
}(window));
