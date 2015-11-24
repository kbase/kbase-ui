/*global define */
/*jslint white: true, browser: true */
define([
    'kb_widgetBases_simpleWidget',
    'kb/common/html',
    'kb_plugin_mainWindow'
],
    function (SimpleWidget, html, Plugin) {
        'use strict';

        function myWidget(config) {
            return SimpleWidget.make({
                runtime: config.runtime,
                on: {
                    start: function (params) {
                        this.setState('test', true);
                    },
                    render: function () {
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