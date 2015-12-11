var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/[sS]pec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/build/client/modules',

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

        thrift: 'bower_components/thrift-binary-protocol/thrift-core',
        thrift_transport_xhr: 'bower_components/thrift-binary-protocol/thrift-transport-xhr',
        thrift_protocol_binary: 'bower_components/thrift-binary-protocol/thrift-protocol-binary',
        kb_common_typeManager: 'bower_components/kbase-common-js/dist/kb/common/typeManager',
        
        kb_ui: 'css/kb-ui',
        kb_datatables: 'css/kb-datatables',
        kb_bootstrap: 'css/kb-bootstrap',
        kb_icons: 'css/kb-icons'
    },
    shim: {
        vega: {
            exports: 'vg',
            deps: ['d3']
        },
        kb_bootstrap: {
            deps: ['bootstrap']
        },
        bootstrap: {
            deps: ['jquery', 'css!bootstrap_css']
        },
        'google-code-prettify': {
            deps: ['css!google-code-prettify-style']
        },
        d3_sankey: {
            deps: ['d3', 'css!d3_sankey_css']
            // deps: ['d3', 'css!d3_sankey_css', 'css!kb/style/sankey']
        },
    },
    map: {
        '*': {
            'css': 'bower_components/require-css/css',
            'promise': 'bluebird'
        }
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});