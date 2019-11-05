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

        makeContainer() {
            const container = this.hostNode.appendChild(document.createElement('div'));
            container.style.display = 'flex';
            container.style.flex = '1 1 0px';
            container.style['flex-direction'] = 'column';
            container.style['overflow-y'] = 'auto';
            return container;
        }

        mount(widgetId, params) {
            // We create the widget mount object first, in order to be
            // able to attach its mounting promise to itself. This is what
            // allows us to interrupt it if the route changes and we need
            // to unmount before it is finished.
            this.mountedWidget = {
                widget: null,
                container: this.makeContainer(),
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
                const mountedWidget  = this.mountedWidget;
                this.mountedWidget = null;
                if (mountedWidget) {
                    // Detach the widget from the container ...
                    if (mountedWidget.promise) {
                        mountedWidget.promise.cancel();
                    }

                    widget = mountedWidget.widget;
                    // First thing is to ensure that the widget is
                    // no longer in the DOM.
                    try {
                        this.hostNode.removeChild(mountedWidget.container);
                    } catch (ex) {
                        // Log error and continue
                        console.error('Error removing mounted widget', ex);
                    }
                    return Promise.try(() => {
                        return widget && widget.stop && widget.stop();
                    })
                        .then(() => {
                            return widget && widget.detach && widget.detach();
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
