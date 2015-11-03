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
        csv: 'bower_components/kbase-common-js/requirejs-csv',
        jquery: 'bower_components/jquery/jquery',
        bluebird: 'bower_components/bluebird/bluebird',
        underscore: 'bower_components/underscore/underscore',
        knockout: 'bower_components/knockout/knockout',
        d3: 'bower_components/d3/d3',
        d3_sankey: 'bower_components/d3-plugins-sankey/sankey',
        d3_sankey_css: 'bower_components/d3-plugins-sankey/sankey',
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
        md5: 'bower_components/SparkMD5/spark-md5',
        'google-code-prettify': 'bower_components/google-code-prettify/prettify',        
        'google-code-prettify-style': 'bower_components/google-code-prettify/prettify',
        handlebars: 'bower_components/handlebars/handlebars',
        nunjucks: 'bower_components/nunjucks/nunjucks',
        font_awesome: 'bower_components/font-awesome/css/font-awesome',
        uuid: 'bower_components/node-uuid/uuid',
        numeral: 'bower_components/numeral/numeral',
        
        'jquery-svg': 'bower_components/jquery.svg/jquery.svg',
            //'jquery-svg-anim': 'bower_components/jquery.svg/jquery.svganim.min',
            //'jquery-svg-dom': 'bower_components/jquery.svg/jquery.svgdom.min',
            //'jquery-svg-filter': 'bower_components/jquery.svg/jquery.svgfilter.min',
            //'jquery-svg-graph': 'bower_components/jquery.svg/jquery.svggraph.min',
            // 'jquery-svg-plot': 'bower_components/jquery.svg/jquery.svgplot.min',
            //'jquery-svg-plot': 'js/lib/widgets/jquery/communities/jquery.svg.plot',
            //'jquery-svg-graph-deviation': 'js/lib/etc/jquery-svg-graph-deviation',

        
        kb_common_html: 'bower_components/kbase-common-js/html',
        kb_common_dom: 'bower_components/kbase-common-js/dom',
        kb_common_domEvent: 'bower_components/kbase-common-js/domEvent',
        kb_common_session: 'bower_components/kbase-common-js/session',
        kb_common_cookie: 'bower_components/kbase-common-js/cookie',
        kb_common_config: 'bower_components/kbase-common-js/config',
        kb_common_logger: 'bower_components/kbase-common-js/logger',
        kb_common_pluginManager: 'bower_components/kbase-common-js/pluginManager',
        kb_common_router: 'bower_components/kbase-common-js/router',
        kb_common_state: 'bower_components/kbase-common-js/state',
        kb_common_props: 'bower_components/kbase-common-js/props',
        kb_common_asyncQueue: 'bower_components/kbase-common-js/asyncQueue',
        kb_common_utils: 'bower_components/kbase-common-js/utils',
        kb_common_messenger: 'bower_components/kbase-common-js/messenger',
        kb_common_observed: 'bower_components/kbase-common-js/observed',
        kb_common_format: 'bower_components/kbase-common-js/format',
        kb_common_gravatar: 'bower_components/kbase-common-js/gravatar',
        kb_common_appServiceManager: 'bower_components/kbase-common-js/appServiceManager',
        
        // widget support should move out into a plugin.
        kb_common_widgetManager: 'bower_components/kbase-common-js/widgets/widgetManager',
        kb_common_widgetMount: 'bower_components/kbase-common-js/widgets/widgetMount',
        kb_common_widgetSet: 'bower_components/kbase-common-js/widgets/widgetSet',

        kb_widgetBases_standardWidget: 'bower_components/kbase-common-js/widgets/standardWidget',
        kb_widgetBases_panelWidget: 'bower_components/kbase-common-js/widgets/panelWidget',
        kb_widgetAdapters_objectWidget: 'bower_components/kbase-common-js/widgetAdapters/widgetAdapter',
        kb_widgetAdapters_kbWidget: 'bower_components/kbase-common-js/widgetAdapters/kbWidgetAdapter',
        
        kb_widgetBases_kbWidget: 'bower_components/kbase-common-js/widgetLegacy/kbaseWidget',        
        kb_widgetBases_kbAuthenticatedWidget: 'bower_components/kbase-common-js/widgetLegacy/kbaseAuthenticatedWidget',
        kb_widget_kbTabs: 'bower_components/kbase-common-js/widgetLegacy/kbTabs',
        kb_widget_helpers: 'bower_components/kbase-common-js/widgetLegacy/kbaseHelperPlugins',
        kb_widget_tabs: 'bower_components/kbase-common-js/widgetLegacy/kbaseTabs',

        kb_common_data: 'js/dev/data',
        kb_widget_buttonBar: 'js/dev/widgets/buttonBar',
        kb_widgetBases_dataWidget: 'js/dev/dataWidget',
        
        
        // Just for testing vega
        kb_common_csv: 'bower_components/kbase-common-js/csv',
        vega: 'bower_components/vega/vega',
        // kb_vegaChartHelper: 'js/vegaChartHelper',
        // utils: 'js/Utils',
        // error: 'js/Error',
        app: 'js/App',        
        // simpleApp: 'js/simpleApp',
        
        thrift: 'bower_components/thrift-binary-protocol/thrift-core',
        thrift_transport_xhr: 'bower_components/thrift-binary-protocol/thrift-transport-xhr',
        thrift_protocol_binary: 'bower_components/thrift-binary-protocol/thrift-protocol-binary',
        
//        taxon_types: 'bower_components/kbase-data-api-js-wrappers/thrift/taxon/taxon_types',
//        taxon_service: 'bower_components/kbase-data-api-js-wrappers/thrift/taxon/thrift_service',        
//        kb_taxon: 'bower_components/kbase-data-api-js-wrappers/Taxon',
//        
        taxon_types: 'bower_components/data-api/thrift/taxon/taxon_types',
        taxon_service: 'bower_components/data-api/thrift/taxon/thrift_service',        
        kb_taxon: 'bower_components/data-api/Taxon',
        
        // TODO: move into separate repo
        // kb_api: 'lib/kbase-client-api',
        // kbase service client support -- should be refactored.
        // kb_narrative: 'js/clients/narrative',
        // kb_types: 'js/clients/types',
        
//        kb_appService_router: 'js/services/router',
//        kb_appService_menu: 'js/services/menu',
//        kb_appService_heartbeat: 'js/services/heartbeat',
//        kb_appService_widget: 'js/services/widget',
//        kb_appService_session: 'js/services/session',
//        kb_appService_data: 'js/services/data',
//        kb_appService_type: 'js/services/type',

        kb_common_typeManager: 'bower_components/kbase-common-js/typeManager',

        kb_ui: 'css/kb-ui',
        kb_datatables: 'css/kb-datatables',
        kb_bootstrap: 'css/kb-bootstrap',
        kb_icons: 'css/kb-icons',
        kb_main: 'js/main'
    },
    shim: {
        vega: {
            exports: 'vg',
            deps: ['d3']
        },
//        kb_ui: {
//            deps: ['css!kb_bootstrap']
//        },
//        kb_bootstrap: {
//            deps: ['bootstrap']
//        },
        
        bootstrap: {
            deps: ['jquery', 'css!bootstrap_css']
        },
        'google-code-prettify': {
            deps: ['css!google-code-prettify-style']
        },
        d3_sankey: {
            deps: ['d3', 'css!d3_sankey_css']
            // deps: ['d3', 'css!d3_sankey_css', 'css!kb/style/sankey']
        }
    },
    map: {
        '*': {
            'css': 'bower_components/require-css/css',
            'promise': 'bluebird'
        }
    }
});