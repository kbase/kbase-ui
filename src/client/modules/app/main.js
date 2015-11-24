/*global define*/
/*jslint white: true*/
define([
     'bluebird',
    'app/App',
    'kb/common/dom',
    'yaml!config/plugin.yml',
    'yaml!config/menu.yml',
    'bootstrap',
    'css!font_awesome',
    'css!app/styles/kb-bootstrap',
    // 'css!kb_icons',
    'css!app/styles/kb-ui',
    'css!app/styles/kb-datatables'
], function (Promise, App, dom, pluginConfig, menuConfig) {
    'use strict';
    Promise.config({
        warnings: true,
        longStackTraces: true
    });
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

    return {
        start: function () {
            return App.run({
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
                plugins: pluginConfig.plugins,
                menus: menuConfig.menus
            });
        }
    };
});
