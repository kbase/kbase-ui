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
        jquery: 'bower_components/jquery/dist/jquery',
        bluebird: 'bower_components/bluebird/js/browser/bluebird',
        thrift: 'js/kb-thrift',
        taxontypes: 'js/taxon_types',
        taxon: 'js/thrift_service',
        utils: 'js/Utils'
    }
});