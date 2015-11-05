/*global
 define, console, window
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'bluebird',
    'kb_common_dom',
    'kb_common_html'
],
    function (Promise, dom, html) {
        'use strict';
        function factory(config) {
            var mounted, container, mountedWidget, runtime;

            mounted = config.node;
            if (!mounted) {
                throw new Error('Cannot create widget mount without a parent node. Pass it as "node"');
            }
            runtime = config.runtime;
            if (!runtime) {
                throw new Error('The widget mounter needs a runtime object in order to find and mount widgets.');
            }
            container = dom.createElement('div');
            container = mounted.appendChild(container);
            container.id = html.genId();
            
            function unmount() {
                return Promise.try(function () {
                    if (mountedWidget) {
                        var widget = mountedWidget.widget;
                        return widget.stop()
                            .then(function () {
                                return widget.detach();
                            })
                            .then(function () {
                                if (widget.destroy) {
                                    return widget.destroy();
                                }
                            });
                    }
                });
            }
            function mount(widgetId, params) {
                return Promise.try(function () {
                        return runtime.getService('widget').makeWidget(widgetId, {});
                    })
                    .then(function (widget) {
                        if (widget === undefined) {
                            throw new Error('Widget could not be created: ' + widgetId);
                        }
                        mountedWidget = {
                            id: html.genId(),
                            widget: widget,
                            container: null,
                            state: 'created'
                        };
                        return [widget, Promise.try(function () {
                            if (widget.init) {
                                return widget.init();
                            }
                        })];
                    })
                    .spread(function (widget) {
                        var c = dom.createElement('div');
                        c.id = mountedWidget.id;
                        container.innerHTML = '';
                        dom.append(container, c);
                        mountedWidget.container = c;
                        return [widget, widget.attach(c)];
                    })
                    .spread(function (widget) {
                        if (widget.start) {
                            return [widget, widget.start(params)];
                        }
                    })
                    .spread(function (widget) {
                        if (widget.run) {
                            return widget.run(params);
                        }
                    });
            }
            function mountWidget(widgetId, params) {
                // stop the old one
                // Stop and unmount current widget.
                return Promise.try(function () {
                    if (mountedWidget) {
                        var widget = mountedWidget.widget;
                        return widget.stop()
                            .then(function () {
                                return widget.detach();
                            })
                            .then(function () {
                                if (widget.destroy) {
                                    return widget.destroy();
                                }
                            });
                    }
                })
                    .then(function () {
                        // return runtime.ask('widgetManager', 'makeWidget', widgetId);
                        return runtime.getService('widget').makeWidget(widgetId, {});
                    })
                    .then(function (widget) {
                        if (widget === undefined) {
                            throw new Error('Widget could not be created: ' + widgetId);
                        }
                        mountedWidget = {
                            id: html.genId(),
                            widget: widget,
                            container: null,
                            state: 'created'
                        };
                        return [widget, Promise.try(function () {
                            if (widget.init) {
                                return widget.init();
                            }
                        })];
                    })
                    .spread(function (widget) {
                        var c = dom.createElement('div');
                        c.id = mountedWidget.id;
                        container.innerHTML = '';
                        dom.append(container, c);
                        mountedWidget.container = c;
                        return [widget, widget.attach(c)];
                    })
                    .spread(function (widget) {
                        if (widget.start) {
                            return [widget, widget.start(params)];
                        }
                    })
                    .spread(function (widget) {
                        if (widget.run) {
                            return widget.run(params);
                        }
                    });
            }
            return {
                mountWidget: mountWidget,
                mount: mount,
                unmount: unmount
            };
        }
    return {
        make: function (config) {
            return factory(config);
        }
    };
});