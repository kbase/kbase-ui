/*global define*/
/*jslint white: true*/
define([
    'app',
    'kb_common_dom',
    'yaml!ui.yml',
    'bootstrap',
    'css!font_awesome',
    'css!kb_bootstrap',
    // 'css!kb_icons',
    'css!kb_ui',
    'css!kb_datatables'
], function (App, dom, uiConfig) {
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
                plugins: uiConfig.plugins,
                menus: uiConfig.menu.menus
            })
                .then(function (runtime) {
                    // R.send('ui', 'setTitle', 'KBase Single Page App Demo Site');
                    // TODO: Move this into the menu service.
                    // just needs to be done after the plugins...
//                    var menus = uiConfig.menu.menus;
//                    Object.keys(menus).forEach(function (menuSet) {
//                        Object.keys(menus[menuSet]).forEach(function (menuSection) {
//                            menus[menuSet][menuSection].forEach(function (menuItem) {
//                                runtime.service('menu').addToMenu({
//                                    name: menuSet,
//                                    section: menuSection,
//                                    position: 'bottom'
//                                }, menuItem);
//                            });
//                        });
//                    });
                    //runtime.service('menu').setMenus(uiConfig.menu.menus);
                    runtime.send('ui', 'addButton', {
                        url: 'http://www.ibm.com',
                        label: 'IBM',
                        icon: 'briefcase',
                        external: true
                    });
                    runtime.send('ui', 'addButton', {
                        label: 'Apple',
                        icon: 'apple', 
                        external: true,
                        callback: function () {
                            alert('Hi, from Apple');
                            window.open('http://www.apple.com');
                        }
                    });
                });
        }
    };
});