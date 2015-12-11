/*global define */
/*jslint white: true, browser: true */
define([
    'bluebird',
    'kb/common/html',
    'kb_plugin_mainWindow',
    'kb/widget/widgetMount'
],
    function (Promise, html, Plugin, WidgetMount) {
        'use strict';

        var widgetMount;

        function factory(config) {
            var widgetMount, runtime = config.runtime;
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
                        // TODO: have an "unmount" action, so that we can 
                        // clean up after unmount, e.g. clear menu, clear title, so that
                        // widgets don't all have
                        widgetMount.unmount()
                            .then(function () {
                                return runtime.sendp('ui', 'clearButtons');
                            })
                            .then(function () {
                                return widgetMount.mount(data.routeHandler.route.widget, data.routeHandler.params);
                            })
                            .catch(function (err) {
                                // need a catch-all widget to mount here??
                                console.log('ERROR mounting widget');
                                console.log(err);
                                widgetMount.unmount()
                                    .then(function () {
                                        return widgetMount.mountWidget('error', {
                                            title: 'ERROR',
                                            error: err
                                        });
                                    })
                                    .catch(function (err2) {
                                        console.log('ERROR mounting error widget!');
                                        console.log(err2);
                                        console.log(err);
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