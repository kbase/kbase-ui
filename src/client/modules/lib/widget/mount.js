define(['bluebird', 'uuid'], (Promise, Uuid) => {
    'use strict';

    class WidgetMount {
        constructor(config) {
            const { node, widgetManager, name } = config;
            if (!node) {
                console.error('ERR', config);
                throw new Error('Cannot create widget mount without a parent node; pass it as "node"');
            }
            this.hostNode = node;
            this.name = name;

            if (!widgetManager) {
                throw new Error('The widget mounter needs a widget manager; pass it as "widgetManager"');
            }
            this.widgetManager = widgetManager;
            this.mountedWidgets = {};
            this.containerID = 0;
            this.orderID = 0;
        }

        nextOrderID() {
            this.orderID += 1;
            return this.orderID;
        }

        makeContainer() {
            this.containerID += 1;
            const container = this.hostNode.appendChild(document.createElement('div'));
            container.style.display = 'flex';
            container.style.flex = '1 1 0px';
            container.style['flex-direction'] = 'column';
            container.style['overflow-y'] = 'auto';
            // container.setAttribute('data-k-b-testhook-element', 'id_' + this.containerID);
            let testName;
            if (this.name) {
                testName = `widgetMount:${this.name}`;
            } else {
                testName = 'widgetMount';
            }
            container.setAttribute('data-k-b-testhook-element', testName);

            return container;
        }

        mount(widgetID, params) {
            // We create the widget mount object first, in order to be
            // able to attach its mounting promise to itself. This is what
            // allows us to interrupt it if the route changes and we need
            // to unmount before it is finished.
            const mountedWidget = {
                widget: null,
                container: this.makeContainer(),
                promise: null,
                id: new Uuid(4).format(),
                widgetID,
                orderID: this.nextOrderID(),
                isCanceled: false
            };
            this.mountedWidgets[mountedWidget.id] = mountedWidget;
            mountedWidget.promise = Promise.try(() => {
                // Make an instance of the requested widget.
                return this.widgetManager.makeWidget(widgetID, {
                    node: mountedWidget.container
                });
            })
                .then((widget) => {
                    // Wrap it in a mount object to help manage it.
                    if (!widget) {
                        throw new Error('Widget could not be created: ' + widgetID);
                    }
                    if (mountedWidget.isCanceled) {
                        throw new Error('Is canceled');
                    }
                    mountedWidget.widget = widget;
                    return Promise.all([widget, widget.init && widget.init()]);
                })
                .then(([widget]) => {
                    // Give it a container and attach it to it.
                    if (mountedWidget.isCanceled) {
                        throw new Error('Is canceled');
                    }
                    return Promise.all([widget, widget.attach && widget.attach(mountedWidget.container)]);
                })
                .then(([widget]) => {
                    // Start it if applicable.
                    if (mountedWidget.isCanceled) {
                        throw new Error('Is canceled');
                    }
                    return Promise.all([widget, widget.start && widget.start(params)]);
                })
                .then(([widget]) => {
                    // Run it if applicable
                    if (mountedWidget.isCanceled) {
                        throw new Error('Is canceled');
                    }
                    return Promise.all([widget, widget.run && widget.run(params)]);
                })
                .then(([widget]) => {
                    if (mountedWidget.isCanceled) {
                        throw new Error('Is canceled');
                    }
                    return widget;
                })
                .finally(() => {
                    if (mountedWidget.orderID < this.orderID) {
                        this.unmount(mountedWidget);
                    }
                });
            return mountedWidget.promise;
        }

        getCurrentMount() {
            const ids = Object.keys(this.mountedWidgets);
            if (ids.length === 1) {
                return this.mountedWidgets[ids[0]];
            }
            return null;
        }

        unmountAll() {
            // Grabs a snapshot of existing mounted widgets.
            const mountedWidgets = this.mountedWidgets;
            this.mountedWidgets = {};
            const mountedWidgetIDs = Object.keys(mountedWidgets);
            if (mountedWidgetIDs.length === 0) {
                return Promise.resolve();
            }
            return Promise.all(mountedWidgetIDs.map((id) => {
                delete this.mountedWidgets[id];
                return this.unmount(mountedWidgets[id]);
            }));
        }

        unmount(mountedWidget) {
            mountedWidget.isCanceled = true;
            return Promise.try(() => {
                // First give the widget a chance to not continue mounting...?
                if (mountedWidget.promise) {
                    mountedWidget.promise.cancel();
                }

                // Detect if the widget was not even provided to the mount yet.
                var widget = mountedWidget.widget;
                if (!mountedWidget.widget) {
                    if (mountedWidget.container && mountedWidget.container.parentNode) {
                        mountedWidget.container.parentNode.removeChild(mountedWidget.container);
                    }
                    return;
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
                    .then(() => {
                        // ensure that a misbehaving widget is actually removed from the DOM.
                        if (mountedWidget.container && mountedWidget.container.parentNode) {
                            mountedWidget.container.parentNode.removeChild(mountedWidget.container);
                        }
                    })
                    .catch((err) => {
                        // ignore errors while unmounting widgets.
                        console.error('[unmount] ERROR unmounting widget');
                        console.error(err);
                        return null;
                    });
            });
        }

        mountWidget(widgetID, params) {
            return this.unmountAll()
                .then(() => {
                    return this.mount(widgetID, params);
                });
        }
    }

    return WidgetMount;
});
