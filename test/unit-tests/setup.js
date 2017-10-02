// This bit will load all of the test spec files;
// The magic "__karma__.files" is set by karma from the unit-tests.conf.js
// file specs.
var tests = [];
var testFilesRe = /^\/base\/test\/unit-tests\/specs\/.*Spec\.js$/;
for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {
        if (testFilesRe.test(file)) {
            tests.push(file);
        }
    }
}

console.log('Loaded ' + tests.length + ' test specs.');

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/build/build/client/modules',
    // NOTE: this needs to be synced from src/require-config.js
    // TODO: bring these in programmatically
    paths: {
        bluebird: 'bower_components/bluebird/bluebird',
        bootstrap_css: 'bower_components/bootstrap/css/bootstrap',
        bootstrap: 'bower_components/bootstrap/js/bootstrap',
        css: 'bower_components/require-css/css',
        csv: 'lib/requirejs-csv',
        d3_sankey_css: 'bower_components/d3-plugins-sankey/sankey',
        d3_sankey: 'bower_components/d3-plugins-sankey/sankey',
        d3: 'bower_components/d3/d3',
        domReady: 'bower_components/requirejs-domready/domReady',
        datatables_bootstrap_css: 'bower_components/datatables-bootstrap3-plugin/css/datatables-bootstrap3',
        datatables_bootstrap: 'bower_components/datatables-bootstrap3-plugin/js/datatables-bootstrap3',
        datatables_css: 'bower_components/datatables/css/jquery.dataTables',
        datatables: 'bower_components/datatables/js/jquery.dataTables',
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
        'knockout-switch-case': 'bower_components/knockout-switch-case/knockout-switch-case',
        'knockout-mapping': 'bower_components/bower-knockout-mapping/knockout.mapping',
        'knockout-plus': 'lib/knockout-plus',
        'knockout-validation': 'bower_components/knockout-validation/knockout.validation',
        marked: 'bower_components/marked/marked',
        md5: 'bower_components/spark-md5/spark-md5',
        moment: 'bower_components/moment/moment',
        numeral: 'bower_components/numeral/numeral',
        nunjucks: 'bower_components/nunjucks/nunjucks',
        plotly: 'bower_components/plotly.js/plotly',
        postal: 'bower_components/postal.js/postal',
        text: 'bower_components/requirejs-text/text',
        underscore: 'bower_components/underscore/underscore',
        uuid: 'bower_components/pure-uuid/uuid',
        yaml: 'bower_components/requirejs-yaml/yaml'
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
        },
        'knockout-plus': {
            deps: ['knockout']
        },
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
    },
    // ask Require.js to load these files (all our tests)
    deps: tests,
    // start test run, once Require.js is done
    callback: window.__karma__.start
});
