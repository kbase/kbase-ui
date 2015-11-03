/*global define */
/*jslint white: true, browser: true */
define([
    'bluebird',
    'kb_widgetBases_standardWidget',
    'kb_common_html',
    'kb_plugin_mainWindow',
    'kb_common_widgetMount'
],
    function (Promise, StandardWidget, html, Plugin, WidgetMount) {
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
                            .then(function () {
                                // console.log('widget mounted');
                            })
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

        function factory(config) {
            var widgetMount;
            function attach(node) {
                return Promise.try(function () {
                    widgetMount = WidgetMount.make({
                        runtime: config.runtime,
                        node: node
                    });
                });
            }
            function start(params) {
                config.runtime.recv('app', 'route-widget', function (data) {
                    if (data.routeHandler.route.widget) {
                        widgetMount.mountWidget(data.routeHandler.route.widget, data.routeHandler.params)
                            .then(function () {
                            })
                            .catch(function (err) {
                                // need a catch-all widget to mount here??
                                console.log('ERROR mounting widget');
                                console.log(err);
                                widgetMount.mountWidget('error', {
                                    title: 'ERROR',
                                    error: err
                                });
                            });
                    } else {
                        console.warn('No widget in route');
                    }
                });
            }
            function detach() {
                // should do something here...
            }

            return {
                attach: attach,
                start: start,
                detach: detach
            };
        }

        return {
            make: function (config) {
                return factory(config);
            }
        };
    });