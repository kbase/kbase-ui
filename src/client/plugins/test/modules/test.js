/*global define */
/*jslint white: true, browser: true */
define([
    'kb_widgetBases_standardWidget',
    'kb_common_dom',
    'kb_common_html'
],
    function (standardWidgetFactory, dom, html, State) {
        'use strict';

        function myWidget(config) {

            var lastTime = Date.now();
            return standardWidgetFactory.make({
                runtime: config.runtime,
                on: {
                    start: function (w) {
                        w.setState('updated', new Date());
                    },
                    render: function (w) {
                        return 'hi, this is a test.'
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