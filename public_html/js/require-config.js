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
        lodash: 'bower_components/lodash/lodash',
        postal: 'bower_components/postal.js/lib/postal',
        
        // For the ui
        bootstrap: 'bower_components/bootstrap/dist/js/bootstrap',
        bootstrap_css: 'bower_components/bootstrap/dist/css/bootstrap',

        
        kb_common_html: 'bower_components/kbase-common-js/src/js/html',
        kb_common_dom: 'bower_components/kbase-common-js/src/js/dom',
        kb_common_session: 'bower_components/kbase-common-js/src/js/session',
        kb_common_cookie: 'bower_components/kbase-common-js/src/js/cookie',
        kb_common_config: 'bower_components/kbase-common-js/src/js/config',
        kb_common_logger: 'bower_components/kbase-common-js/src/js/logger',
        kb_common_pluginManager: 'bower_components/kbase-common-js/src/js/pluginManager',
        kb_common_router: 'bower_components/kbase-common-js/src/js/router',
        kb_common_state: 'bower_components/kbase-common-js/src/js/state',
        kb_common_props: 'bower_components/kbase-common-js/src/js/props',
        kb_common_asyncQueue: 'bower_components/kbase-common-js/src/js/asyncQueue',
        kb_common_utils: 'bower_components/kbase-common-js/src/js/utils',
        kb_common_messenger: 'bower_components/kbase-common-js/src/js/messenger',
        kb_common_observed: 'bower_components/kbase-common-js/src/js/observed',
        
        // widget support should move out into a plugin.
        kb_common_widgetManager: 'bower_components/kbase-common-js/src/js/widgetManager',
        kb_common_widgetMount: 'bower_components/kbase-common-js/src/js/widgetMount',
        kb_common_widgetSet: 'bower_components/kbase-common-js/src/js/widgetSet',
        kb_widgetBases_standardWidget: 'bower_components/kbase-common-js/src/js/widgetBases/standardWidget',
        kb_widgetBases_panelWidget: 'js/panelWidget',
        
        thrift: 'js/kb-thrift',
        utils: 'js/Utils',
        error: 'js/Error',
        app: 'js/App',
        simpleApp: 'js/simpleApp',
        taxontypes: 'js/taxon_types',
        taxon: 'js/thrift_service',
        kb_taxon: 'js/TaxonAPI',
        kb_api: 'lib/kbase-client-api',
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
        },
        bootstrap: {
            deps: ['jquery']
        },
    },
    map: {
        '*': {
            'css': 'bower_components/require-css/css'
        }
    }
});

(function () {
    var kbClients = [
        ['narrative_method_store', 'NarrativeMethodStore'],
        ['user_profile', 'UserProfile'],
        ['workspace', 'Workspace'],
        ['cdmi', 'CDMI_API'],
        ['cdmi-entity', 'CDMI_EntityAPI'],
        ['trees', 'KBaseTrees'],
        ['fba', 'fbaModelServices'],
        ['ujs', 'UserAndJobState'],
        ['networks', 'KBaseNetworks']
    ];
    // NB need the immediate function exec below in order to avoid
    // variable capture problem with anon funcs.
    kbClients.forEach(function (client) {
        define('kb_service_' + client[0], ['kb_api'], function () {
            return (function (c) {
                return c;
            }(window[client[1]]));
        });
    });
}());
