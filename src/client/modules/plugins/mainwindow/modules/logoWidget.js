/*global define */
/*jslint white: true, browser: true */
define([
    'kb_widget/bases/simpleWidget',
    'kb_common/html',
    'kb_plugin_mainWindow'
],
    function (SimpleWidget, html, Plugin) {
        'use strict';

        function myWidget(config) {
            return SimpleWidget.make({
                runtime: config.runtime,
                on: {
                    start: function () {
                        this.setState('test', true);
                    },
                    render: function () {
                        var a = html.tag('a'),
                            img = html.tag('img'),
                            div = html.tag('div');
                        return div({class: 'kb-logo-widget'}, a({href: this.runtime.config('resources.docSite.base.url')}, [
                            img({id: 'logo', src: Plugin.plugin.fullPath + '/images/kbase_logo.png', width: '46'})
                        ]));
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