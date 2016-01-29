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
        knockout: 'bower_components/knockout/knockout',
        css: 'bower_components/require-css/css',
        text: 'bower_components/requirejs-text/text',
        json: 'bower_components/requirejs-json/json',
        yaml: 'bower_components/require-yaml/yaml',
        'js-yaml': 'bower_components/js-yaml/js-yaml',
        csv: 'bower_components/kbase-common-js/dist/kb/common/requirejs-csv',
        jquery: 'bower_components/jquery/jquery',
        bluebird: 'bower_components/bluebird/bluebird',
        underscore: 'bower_components/underscore/underscore',
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

        kb_ui: 'css/kb-ui',
        kb_datatables: 'css/kb-datatables',
        kb_bootstrap: 'css/kb-bootstrap',
        kb_icons: 'css/kb-icons',
        
        // This really should be brought in somehow else.
        // Perhaps namespace it???
        //thrift: 'bower_components/thrift-binary-protocol/thrift-core',
        //thrift_transport_xhr: 'bower_components/thrift-binary-protocol/thrift-transport-xhr',
        //thrift_protocol_binary: 'bower_components/thrift-binary-protocol/thrift-protocol-binary',

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