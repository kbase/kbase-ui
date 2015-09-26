/*global define */
/*jslint white: true, browser: true */
define([
    'kb_widgetBases_standardWidget',
    'kb_common_html',
    'kb_plugin_mainWindow'
],
    function (StandardWidget, html, Plugin) {
        'use strict';

        function myWidget(config) {
            return StandardWidget.make({
                runtime: config.runtime,
                on: {
                    start: function (w, params) {
                        w.setState('test', true);
                    },
                    render: function (w) {
                        var a = html.tag('a'),
                            img = html.tag('img');
                        return a({href: 'http://kbase.us'}, [
                            img({id: 'logo', src: Plugin.plugin.path + '/images/kbase_logo.png', width: '46'})
                        ]);
                    }
                }
            });
        }

        return {
            make: function (config) {
                return myWidget(config);
            }
        };
    });