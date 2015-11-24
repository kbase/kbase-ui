'use strict';
require.config({
    baseUrl: '/modules',
    catchError: true,
    onError: function (err) {
        console.log(err.requireType);
        if (err.requireType === 'timeout') {
            console.log('modules: ' + err.requireModules);
        }

        throw err;
    },
    paths: {
        // External Dependencies
        // ----------------------
        css: 'bower_components/require-css/css',
        text: 'bower_components/requirejs-text/text',
        json: 'bower_components/requirejs-json/json',
        yaml: 'bower_components/require-yaml/yaml',
        'js-yaml': 'bower_components/js-yaml/js-yaml',
        csv: 'bower_components/kbase-common-js/dist/kb/common/requirejs-csv',
        jquery: 'bower_components/jquery/jquery',
        bluebird: 'bower_components/bluebird/bluebird',
        underscore: 'bower_components/underscore/underscore',
        knockout: 'bower_components/knockout/knockout',
        d3: 'bower_components/d3/d3',
        d3_sankey: 'bower_components/d3-plugins-sankey/sankey',
        d3_sankey_css: 'bower_components/d3-plugins-sankey/sankey',
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


//        'kb/common/lang': 'dev/lang',
//        'kb/common/data': 'dev/data',
//        'kb/common/messenger': 'dev/messenger',
//        'kb/common/pluginManager': 'dev/pluginManager',
//        'kb/common/asyßncQueue': 'dev/asyncQueue',
//        'kb/common/appServiceManager': 'dev/appServiceManager',

//        kb_common_html: 'bower_components/kbase-common-js/dist/kb/common/html',
//        kb_common_dom: 'bower_components/kbase-common-js/dist/kb/common/dom',
//        kb_common_domEvent: 'bower_components/kbase-common-js/dist/kb/common/domEvent',
//        kb_common_session: 'bower_components/kbase-common-js/dist/kb/common/session',
//        kb_common_cookie: 'bower_components/kbase-common-js/dist/kb/common/cookie',
//        kb_common_config: 'bower_components/kbase-common-js/dist/kb/common/config',
//        kb_common_logger: 'bower_components/kbase-common-js/dist/kb/common/logger',
//        kb_common_router: 'bower_components/kbase-common-js/dist/kb/common/router',
//        kb_common_state: 'bower_components/kbase-common-js/dist/kb/common/state',
//        kb_common_props: 'bower_components/kbase-common-js/dist/kb/common/props',
//        kb_common_utils: 'bower_components/kbase-common-js/dist/kb/common/utils',
//        kb_common_observed: 'bower_components/kbase-common-js/dist/kb/common/observed',
//        kb_common_format: 'bower_components/kbase-common-js/dist/kb/common/format',
//        kb_common_gravatar: 'bower_components/kbase-common-js/dist/kb/common/gravatar',
//        kb_common_csv: 'bower_components/kbase-common-js/dist/kb/common/csv',

        

        // kb_widget_buttonBar: 'dev/widgets/buttonBar',
        
        
        // widget support should move out into a plugin.
        
//        kb_common_widgetManager: 'bower_components/kbase-common-js/dist/kb/common/widgets/widgetManager',
//        kb_common_widgetMount: 'bower_components/kbase-common-js/dist/kb/common/widgets/widgetMount',
//        kb_common_widgetSet: 'bower_components/kbase-common-js/dist/kb/common/widgets/widgetSet',
//        kb_widgetAdapters_objectWidget: 'bower_components/kbase-common-js/dist/kb/common/widgetAdapters/widgetAdapter',
//        kb_widgetAdapters_kbWidget: 'bower_components/kbase-common-js/dist/kb/common/widgetAdapters/kbWidgetAdapter',
//        kb_widgetBases_kbWidget: 'bower_components/kbase-common-js/dist/kb/common/widgetLegacy/kbaseWidget',
//        kb_widgetBases_panelWidget: 'bower_components/kbase-common-js/dist/kb/common/widgets/panelWidget',
//        kb_widgetBases_kbAuthenticatedWidget: 'bower_components/kbase-common-js/dist/kb/common/widgetLegacy/kbaseAuthenticatedWidget',
//        kb_widget_kbTabs: 'bower_components/kbase-common-js/dist/kb/common/widgetLegacy/kbTabs',
//        kb_widget_helpers: 'bower_components/kbase-common-js/dist/kb/common/widgetLegacy/kbaseHelperPlugins',
//        kb_widget_tabs: 'bower_components/kbase-common-js/dist/kb/common/widgetLegacy/kbaseTabs',
//        kb_widget_button_controls: 'bower_components/kbase-common-js/dist/kb/common/widgetLegacy/kbaseButtonControls',
//        kb_widget_delete_prompt: 'bower_components/kbase-common-js/dist/kb/common/widgetLegacy/kbaseDeletePrompt',
//        kb_widget_prompt: 'bower_components/kbase-common-js/dist/kb/common/widgetLegacy/kbasePrompt',
//        kb_widget_search_controls: 'bower_components/kbase-common-js/dist/kb/common/widgetLegacy/kbaseSearchControls',
//        kb_widget_table: 'bower_components/kbase-common-js/dist/kb/common/widgetLegacy/kbaseTable',
//        
//        
//        kb_vis_visWidget: 'bower_components/kbase-common-js/dist/kb/common/vis/kbaseVisWidget',
//        kb_vis_point: 'bower_components/kbase-common-js/dist/kb/common/vis/geometry/point',
//        kb_vis_rectangle: 'bower_components/kbase-common-js/dist/kb/common/vis/geometry/rectangle',
//        kb_vis_size: 'bower_components/kbase-common-js/dist/kb/common/vis/geometry/size',
//        kb_vis_RGBColor: 'bower_components/kbase-common-js/dist/kb/common/vis/RGBColor',
//        kb_vis_barchart: 'bower_components/kbase-common-js/dist/kb/common/vis/kbaseBarchart',
//        kb_vis_chordchart: 'bower_components/kbase-common-js/dist/kb/common/vis/kbaseChordchart',
//        kb_vis_circular_heatmap: 'bower_components/kbase-common-js/dist/kb/common/vis/kbaseCircularHeatmap',
//        kb_vis_forced_network: 'bower_components/kbase-common-js/dist/kb/common/vis/kbaseForcedNetwork',
//        kb_vis_heatmap: 'bower_components/kbase-common-js/dist/kb/common/vis/kbaseHeatmap',
//        kb_vis_histogram: 'bower_components/kbase-common-js/dist/kb/common/vis/kbaseHistogram',
//        kb_vis_linechart: 'bower_components/kbase-common-js/dist/kb/common/vis/kbaseLinechart',
//        kb_vis_lineserieschart: 'bower_components/kbase-common-js/dist/kb/common/vis/kbaseLineSerieschart',
//        kb_vis_piechart: 'bower_components/kbase-common-js/dist/kb/common/vis/kbasePiechart',
//        kb_vis_scatterplot: 'bower_components/kbase-common-js/dist/kb/common/vis/kbaseScatterplot',
//        kb_vis_sparkline: 'bower_components/kbase-common-js/dist/kb/common/vis/kbaseSparkline',
//        kb_vis_treechart: 'bower_components/kbase-common-js/dist/kb/common/vis/kbaseTreechart',        
//        kb_vis_venndiagram: 'bower_components/kbase-common-js/dist/kb/common/vis/kbaseVenndiagram',
//        
//        
//        kb_widgetBases_dataWidget: 'bower_components/kbase-common-js/dist/kb/common/widgetBases/dataWidget',
//        kb_widgetBases_simpleWidget: 'bower_components/kbase-common-js/dist/kb/common/widgetBases/simpleWidget',
        
        
        // utils: 'js/Utils',
        // error: 'js/Error',
        // app: 'js/App',

        thrift: 'bower_components/thrift-binary-protocol/thrift-core',
        thrift_transport_xhr: 'bower_components/thrift-binary-protocol/thrift-transport-xhr',
        thrift_protocol_binary: 'bower_components/thrift-binary-protocol/thrift-protocol-binary',
        kb_common_typeManager: 'bower_components/kbase-common-js/dist/kb/common/typeManager',
        
        kb_ui: 'css/kb-ui',
        kb_datatables: 'css/kb-datatables',
        kb_bootstrap: 'css/kb-bootstrap',
        kb_icons: 'css/kb-icons',
        //kb_main: 'js/main',
        //kb_startup: 'js/startup'
    },
    shim: {
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
            // 'css': 'bower_components/require-css/css',
            'promise': 'bluebird'
        }
    }
});
