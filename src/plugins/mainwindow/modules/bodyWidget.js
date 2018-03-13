/*global define*/
/*jslint white:true,browser: true*/
define([
    'bluebird',
    'kb_widget/widgetMount'
], function (
    Promise,
    WidgetMount
) {
    'use strict';

    function factory(config) {
        var widgetMount, runtime = config.runtime,
            routeListener;
        var container;

        function attach(node) {
            container = node.appendChild(document.createElement('div'));
            container.style.display = 'flex';
            container.style.flex = '1 1 0px';
            container.style['flex-direction'] = 'column';
            container.style['overflow-y'] = 'auto';

            return Promise.try(function () {
                widgetMount = WidgetMount.make({
                    runtime: config.runtime,
                    node: container
                });
            });
        }

        function start() {
            routeListener = runtime.recv('app', 'route-widget', function (data) {
                if (data.routeHandler.route.widget) {
                    widgetMount.unmount()
                        .then(function () {
                            return runtime.sendp('ui', 'clearButtons');
                        })
                        .then(function () {
                            return widgetMount.mount(data.routeHandler.route.widget, data.routeHandler.params);
                        })
                        .catch(function (err) {
                            // need a catch-all widget to mount here??
                            console.error('ERROR mounting widget', err, data);
                            widgetMount.unmount()
                                .then(function () {
                                    // Note that 'error' is a globally defined widget dependency.
                                    return widgetMount.mountWidget('error', {
                                        title: 'ERROR',
                                        error: err
                                    });
                                })
                                .catch(function (err2) {
                                    console.error('ERROR mounting error widget!');
                                    console.error(err2);
                                    console.error(err);
                                });
                        });
                } else {
                    console.warn('No widget in route');
                }
            });
        }

        function stop() {
            if (routeListener) {
                runtime.drop(routeListener);
            }
        }

        return {
            attach: attach,
            start: start,
            stop: stop
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});
