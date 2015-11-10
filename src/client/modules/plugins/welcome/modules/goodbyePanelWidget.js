/*global define */
/*jslint white: true, browser: true */
define([
    'kb_widgetBases_simpleWidget',
    'kb_common_dom',
    'kb_common_html'
],
    function (simpleWidgetFactory, dom, html) {
        'use strict';

        function myWidget(config) {
            return simpleWidgetFactory.make({
                runtime: config.runtime,
                on: {
                    start: function () {
                        this.set('updated', new Date());
                    },
                    render: function () {
                        return 'Goodbye.';
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