define(['bluebird'], (Promise) => {
    'use strict';

    class WidgetMount {
        constructor(config) {
            if (!config.node) {
                throw new Error('Cannot create widget mount without a parent node; pass it as "node"');
            }
            this.hostNode = config.node;

            if (!config.widgetManager) {
                throw new Error('The widget mounter needs a widget manager; pass it as "widgetManager"');
            }
            this.widgetManager = config.widgetManager;
            this.container = this.hostNode;
            this.mountedWidget = null;
        }

        mount(widgetId, params) {
            // We create the widget mount object first, in order to be
            // able to attach its mounting promise to itself. This is what
            // allows us to interrupt it if the route changes and we need
            // to unmount before it is finished.
            this.mountedWidget = {
                widget: null,
                container: null,
                promise: null
            };
            this.mountedWidget.promise = Promise.try(() => {
                // Make an instance of the requested widget.
                return this.widgetManager.makeWidget(widgetId, {});
            })
                .then((widget) => {
                    // Wrap it in a mount object to help manage it.
                    if (!widget) {
                        throw new Error('Widget could not be created: ' + widgetId);
                    }
                    this.mountedWidget.widget = widget;
                    return Promise.all([widget, widget.init && widget.init()]);
                })
                .then(([widget]) => {
                    // Give it a container and attach it to it.

                    // aww, just give it the container...
                    // mountedWidget.container = container.appendChild(dom.createElement('div'));
                    this.mountedWidget.container = this.container;
                    return Promise.all([widget, widget.attach && widget.attach(this.mountedWidget.container)]);
                })
                .then(([widget]) => {
                    // Start it if applicable.
                    return Promise.all([widget, widget.start && widget.start(params)]);
                })
                .then(([widget]) => {
                    // Run it if applicable
                    return Promise.all([widget, widget.run && widget.run(params)]);
                })
                .then(([widget]) => {
                    return widget;
                });
            return this.mountedWidget.promise;
        }

        unmount() {
            return Promise.try(() => {
                // TODO make no assumptions about what is mounted, just
                // unmount anything we find...
                var widget;
                if (this.mountedWidget) {
                    // Detach the widget from the container ...
                    if (this.mountedWidget.promise) {
                        this.mountedWidget.promise.cancel();
                    }

                    widget = this.mountedWidget.widget;
                    return Promise.try(() => {
                        return widget && widget.stop && widget.stop();
                    })
                        .then(() => {
                            return widget && widget.detach && widget.detach();
                        })
                        .then(() => {
                            while (this.container.firstChild) {
                                this.container.removeChild(this.container.firstChild);
                            }
                        })
                        .then(() => {
                            return widget && widget.destroy && widget.destroy();
                        })
                        .catch((err) => {
                            // ignore errors while unmounting widgets.
                            console.error('ERROR unmounting widget');
                            console.error(err);
                            return null;
                        })
                        .finally(() => {
                            this.mountedWidget = null;
                        });
                }
                return null;
            });
        }

        mountWidget(widgetId, params) {
            return this.unmount().then(() => {
                return this.mount(widgetId, params);
            });
        }
    }

    return { WidgetMount };
});
