/*global define*/
/*jslint white: true*/
define([
    'bluebird',
    'app/App',
    'app/googleAnalytics',
    'kb/common/dom',
    'yaml!config/plugin.yml',
    'yaml!config/settings.yml',
    'yaml!config/service.yml',
    'bootstrap',
    'css!font_awesome',
    'css!app/styles/kb-bootstrap',
    'css!app/styles/kb-icons',
    'css!app/styles/kb-ui',
    'css!app/styles/kb-datatables'
], function (Promise, App, ga, dom, pluginConfig, clientConfig, serviceConfig) {
    'use strict';
    Promise.config({
        warnings: true,
        longStackTraces: true,
        cancellation: true
    });
    function setErrorField(name, ex) {
        var selector = '[data-field="' + name + '"] > span[data-name="value"]';
        dom.setHtml(selector, ex[name]);
    }
    function displayStatus(msg) {
        return;
        // dom.setHtml(dom.qs('#status'), 'started');
    }
    ga.create();
    ga.send();

    return {
        start: function () {
            return App.run({
                clientConfig: clientConfig,
                serviceConfig: serviceConfig,
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
                menus: clientConfig.menus
            })
            .then(function (runtime) {
                switch (serviceConfig.deploy.environment) {
                    case 'ci':
                        runtime.send('ui', 'alert', {
                            type: 'success', 
                            message: 'You are operating in the Continuous Integration (CI) environment'
                        });
                        break;
                    case 'next':
                        runtime.send('ui', 'alert', {
                            type: 'warning', 
                            message: 'You are operating in the Next environment'
                        });
                        break;
                }
            });
        }
    };
});