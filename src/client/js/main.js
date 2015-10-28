/*global define*/
/*jslint white: true*/
define([
    'app',
    'kb_common_dom',
    'css!font_awesome',
    'css!kb_bootstrap',
    'css!kb_icons',
    'css!kb_ui'
], function (App, dom) {
    'use strict';
    function makeSymbol(s) {
        return s.trim(' ').replace(/ /, '_');
    }
    function setErrorField(name, ex) {
        var selector = '[data-field="' + name + '"] > span[data-name="value"]';
        dom.setHtml(selector, ex[name]);
    }
    function displayStatus(msg) {
        return;
        // dom.setHtml(dom.qs('#status'), 'started');
    }
    function displayError(ex) {
        alert('Error: ' + ex.message);
        return;
        // for now...
        ['name', 'subject', 'type', 'message', 'suggestion', 'infoUrl', 'stack'].forEach(function (name) {
            setErrorField(name, ex);
        });
        dom.qs('#error').style.display = 'block';
    }
    displayStatus('running');
    // dom.qs('#status').innerHTML = 'running...';
    App.run({
        nodes: {
            root: {
                selector: '#root'
            },
            error: {
                selector: '#error'
            },
            status: {
                selector: '#status'
            }
        },
        plugins: [
            ['mainwindow', 'message', 'welcome', 'login', {
                    name: 'serviceclients',
                    directory: 'bower_components/kbase-service-clients-js'
                }, 'userprofileservice'],
            [
                'databrowser',
                'dataview',
                'dashboard',
                'userprofile',
                'datasearch',
                'narrativemanager',
                'narrativestore'
            ]
        ]
    })
        .then(function () {
            // R.send('ui', 'setTitle', 'KBase Single Page App Demo Site');                       
        })
        .catch(function (err) {
            console.log('ERROR in index.html');
            console.log(err);
            displayError(err);
        });
});