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
        'js-yaml': 'bower_components/js-yaml/js-yaml',
        csv: 'js/requirejs-csv',
        jquery: 'bower_components/jquery/jquery',
        bluebird: 'bower_components/bluebird/bluebird',
        underscore: 'bower_components/underscore/underscore',
        knockout: 'bower_components/knockout/knockout',
        d3: 'bower_components/d3/d3',
        //nvd3: 'bower_components/nvd3/build/nv.d3',
        //chartist: 'bower_components/chartist/dist/chartist',
        //chartist_css: 'bower_components/chartist/dist/chartist.min',
        //vega: 'bower_components/vega/vega',
        //vegaChartHelper: 'js/vegaChartHelper',
        //regression: 'js/regression',
        lodash: 'bower_components/lodash/lodash',
        postal: 'bower_components/postal.js/postal',
        
        // For the ui
        bootstrap: 'bower_components/bootstrap/js/bootstrap',
        bootstrap_css: 'bower_components/bootstrap/css/bootstrap',
        datatables: 'bower_components/datatables/js/jquery.dataTables',
        datatables_css: 'bower_components/datatables/css/jquery.dataTables',
        datatables_bootstrap: 'bower_components/datatables-bootstrap3-plugin/js/datatables-bootstrap3',
        datatables_bootstrap_css: 'bower_components/datatables-bootstrap3-plugin/css/datatables-bootstrap3',


        
        kb_common_html: 'bower_components/kbase-common-js/html',
        kb_common_dom: 'bower_components/kbase-common-js/dom',
        kb_common_session: 'bower_components/kbase-common-js/session',
        kb_common_cookie: 'bower_components/kbase-common-js/cookie',
        kb_common_config: 'bower_components/kbase-common-js/config',
        kb_common_logger: 'bower_components/kbase-common-js/logger',
        kb_common_pluginManager: 'bower_components/kbase-common-js/pluginManager',
        kb_common_router: 'js/router',
        kb_common_state: 'bower_components/kbase-common-js/state',
        kb_common_props: 'bower_components/kbase-common-js/props',
        kb_common_asyncQueue: 'bower_components/kbase-common-js/asyncQueue',
        kb_common_utils: 'bower_components/kbase-common-js/utils',
        kb_common_apiUtils: 'bower_components/kbase-common-js/apiUtils',
        kb_common_messenger: 'bower_components/kbase-common-js/messenger',
        kb_common_observed: 'bower_components/kbase-common-js/observed',
        
        // widget support should move out into a plugin.
        kb_common_widgetManager: 'bower_components/kbase-common-js/widgetManager',
        kb_common_widgetMount: 'js/widgetMount',
        kb_common_widgetSet: 'bower_components/kbase-common-js/widgetSet',
        kb_widgetBases_standardWidget: 'js/standardWidget',
        kb_widgetBases_panelWidget: 'js/panelWidget',
        kb_widgetAdapters_objectWidget: 'js/widgetAdapters/widgetAdapter',
        
        // Just for testing vega
        kb_common_csv: 'js/csv',
        vega: 'bower_components/vega/vega',
        kb_vegaChartHelper: 'js/vegaChartHelper',
        
        thrift: 'js/kb-thrift',
        utils: 'js/Utils',
        error: 'js/Error',
        app: 'js/App',
        simpleApp: 'js/simpleApp',
        taxontypes: 'js/taxon_types',
        taxon: 'js/thrift_service',
        kb_taxon: 'js/TaxonAPI',
        // TODO: move into separate repo
        kb_api: 'lib/kbase-client-api',
        
        // kbase service client support -- should be refactored.
        kb_narrative: 'js/narrative',
        kb_types: 'js/types',
        
        kb_service_router: 'js/services/router',
        kb_service_menu: 'js/services/menu'
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
            deps: ['jquery', 'css!bootstrap_css']
        },
    },
    map: {
        '*': {
            'css': 'bower_components/require-css/css',
            'promise': 'bluebird'
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
