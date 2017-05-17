// For dev this should be set at app load time or manually set
// if the cache seems to be sticky (it may not be nessary to ALWAYS
// bust the cache.)
// For production we should use the commit hash or
// semver
var build = window.__kbase__build__;
var buildKey;
switch (build.deployType) {
    case 'dev':
        // buildKey = new Date().getTime();
        buildKey = new Date().getTime();
        break;
    case 'prod':
        buildKey = build.gitCommitHash;
        break;
    default:
        throw new Error('Unsupported deploy type: ' + build.deployType);
}
var require = {
    baseUrl: '/modules',
    urlArgs: "cb=" + buildKey,
    catchError: true,
    waitSeconds: 60,
    paths: {
        // External Dependencies
        // ----------------------
        'google-code-prettify-style': 'bower_components/google-code-prettify/prettify',
        'google-code-prettify': 'bower_components/google-code-prettify/prettify',
        'jquery-svg': 'bower_components/jquery.svg/jquery.svg',
        'js-yaml': 'bower_components/js-yaml/js-yaml',
        'knockout-validation': 'bower_components/knockout-validation/knockout.validation',
        bluebird: 'bower_components/bluebird/bluebird',
        bootstrap_css: 'bower_components/bootstrap/css/bootstrap',
        bootstrap: 'bower_components/bootstrap/js/bootstrap',
        css: 'bower_components/require-css/css',
        csv: 'bower_components/kbase-common-js/dist/kb/common/requirejs-csv',
        d3_sankey_css: 'bower_components/d3-plugins-sankey/sankey',
        d3_sankey: 'bower_components/d3-plugins-sankey/sankey',
        d3: 'bower_components/d3/d3',
        datatables_bootstrap_css: 'bower_components/datatables-bootstrap3-plugin/css/datatables-bootstrap3',
        datatables_bootstrap: 'bower_components/datatables-bootstrap3-plugin/js/datatables-bootstrap3',
        datatables_css: 'bower_components/datatables/css/jquery.dataTables',
        datatables: 'bower_components/datatables/js/jquery.dataTables',
        domReady: 'bower_components/requirejs-domready/domReady',
        esprima: 'bower_components/esprima/esprima',
        font_awesome: 'bower_components/font-awesome/css/font-awesome',
        handlebars: 'bower_components/handlebars/handlebars',
        highlight_css: 'bower_components/highlightjs/styles/tomorrow',
        highlight: 'bower_components/highlightjs/highlight.pack',
        jquery: 'bower_components/jquery/jquery',
        json: 'bower_components/requirejs-json/json',
        kb_bootstrap: 'css/kb-bootstrap',
        kb_datatables: 'css/kb-datatables',
        kb_icons: 'css/kb-icons',
        kb_ui: 'css/kb-ui',
        knockout: 'bower_components/knockout/knockout',
        marked: 'bower_components/marked/marked',
        md5: 'bower_components/SparkMD5/spark-md5',
        numeral: 'bower_components/numeral/numeral',
        nunjucks: 'bower_components/nunjucks/nunjucks',
        plotly: 'bower_components/plotly/plotly',
        postal: 'bower_components/postal.js/postal',
        text: 'bower_components/requirejs-text/text',
        underscore: 'bower_components/underscore/underscore',
        uuid: 'bower_components/pure-uuid/uuid',
        yaml: 'bower_components/require-yaml/yaml'
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
        },
        highlight: {
            deps: ['css!highlight_css']
        }
    },
    map: {
        '*': {
            // 'css': 'bower_components/require-css/css',
            'promise': 'bluebird'
        }
    }
};