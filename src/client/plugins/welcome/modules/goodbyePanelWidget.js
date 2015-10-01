/*global define */
/*jslint white: true, browser: true */
define([
    'kb_widgetBases_standardWidget',
    'kb_common_dom',
    'kb_common_html'
],
    function (standardWidgetFactory, dom, html) {
        'use strict';

        function myWidget(config) {
            return standardWidgetFactory.make({
                runtime: config.runtime,
                on: {
                    start: function (w) {
                        w.setState('updated', new Date());
                    },
                    render: function (w) {
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