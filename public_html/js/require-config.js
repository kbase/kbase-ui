'use strict';
require.config({
    baseUrl: '/',
    catchError: true,
    onError: function (err) {
        alert("RequireJS Error:" + err);
    },
    paths: {
        // External Dependencies
        // ----------------------
        text: 'bower_components/requirejs-text/text',
        json: 'bower_components/requirejs-json/json',
        yaml: 'bower_components/require-yaml/yaml',
        'js-yaml': 'bower_components/js-yaml/dist/js-yaml',
        csv: 'js/requirejs-csv',
        jquery: 'bower_components/jquery/dist/jquery',
        bluebird: 'bower_components/bluebird/js/browser/bluebird',
        underscore: 'bower_components/underscore/underscore',
        knockout: 'bower_components/knockout/dist/knockout',
        d3: 'bower_components/d3/d3',
        nvd3: 'bower_components/nvd3/build/nv.d3',
        chartist: 'bower_components/chartist/dist/chartist',
        chartist_css: 'bower_components/chartist/dist/chartist.min',
        vega: 'bower_components/vega/vega',
        vegaChartHelper: 'js/vegaChartHelper',
        regression: 'js/regression',
        kb_common_html: 'bower_components/kbase-common-js/src/js/html',
        kb_common_dom: 'bower_components/kbase-common-js/src/js/dom',
        kb_common_session: 'bower_components/kbase-common-js/src/js/session',
        kb_common_cookie: 'bower_components/kbase-common-js/src/js/cookie',
        kb_common_config: 'bower_components/kbase-common-js/src/js/config',
        kb_common_logger: 'bower_components/kbase-common-js/src/js/logger',
        kb_common_pluginManager: 'js/pluginManager',
        thrift: 'js/kb-thrift',
        utils: 'js/Utils',
        error: 'js/Error', 
        app: 'js/App',
        taxontypes: 'js/taxon_types',
        taxon: 'js/thrift_service',
        kb_taxon: 'js/TaxonAPI'
    },
    shim: {
        chartist: {
            deps: ['css!chartist_css']
        },
        vega: {
            exports: 'vg',
            deps: ['d3']
        },
        nvd3: {
            exports: 'nv',
            deps: ['d3']
        }
    },
    map: {
        '*': {
            'css': 'bower_components/require-css/css'
        }
    }
});
