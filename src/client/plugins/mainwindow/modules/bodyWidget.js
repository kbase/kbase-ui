/*global define */
/*jslint white: true, browser: true */
define([
    'kb_widgetBases_standardWidget',
    'kb_common_html',
    'kb_plugin_mainWindow',
    'kb_common_widgetMount'
],
    function (StandardWidget, html, Plugin, WidgetMount) {
        'use strict';
        
        var widgetMount;

        function myWidget(config) {
            return StandardWidget.make({
                runtime: config.runtime,
                on: {
                    attach: function (w, node) {
                        // create a widget mount on the node.
                        widgetMount = WidgetMount.make({
                            runtime: config.runtime,
                            node: node
                        });
                    },
                    start: function (w, params) {
                        // Listen for new-route events...
                        w.recv('app', 'route-widget', function (data) {
                            if (data.routeHandler.route.widget) {
                                w.setState('widget', data.routeHandler.route.widget);
                                w.setState('params', data.routeHandler.params);
                            } else {
                                w.setState('widget', null);
                                w.setState('params', null);
                            }
                        });
                    },
                    render: function (w) {
                        var widget = w.getState('widget');
                        if (!widget) {
                            var div = html.tag('div');
                            return div({}, [
                                'No widget is set'
                            ]);
                        }
                        widgetMount.mountWidget(widget, w.getState('params'))
                            .catch(function (err) {
                                // need a catch-all widget to mount here??
                                console.log('ERROR mounting widget');
                                console.log(err);
                                widgetMount.mountWidget('error', {
                                    title: 'ERROR',
                                    error: err
                                });
                            });
                        return null;
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