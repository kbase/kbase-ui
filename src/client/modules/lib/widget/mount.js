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
            this.orderID = 0;
        }

        /*
            Generates the next ordering id.
        */
        nextOrderID() {
            this.orderID += 1;
            return this.orderID;
        }

        /*
            Create a new container node for usage by a new mount.
            Each mount gets it's own parent node, freshly created just of it.
            This helps protect the app from widgets which might erroneously append
            or otherwise modify it's own parent.
            The container node is a full-height flexbox, which is compliant with the
            overall ui design.
        */
        makeContainer() {
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

        /*
            Mounts a widget given by its ID with a set of parameters, as provided by the
            navigation path, which is ultimately guided by the path config for a plugin.
        */
        mount(widgetID, params) {
            // We create the widget mount object first, in order to be
            // able to attach its mounting promise to itself. This is what
            // allows us to interrupt it if the route changes and we need
            // to un-mount before it is finished.
            const mountedWidget = {
                widget: null,
                container: this.makeContainer(),
                promise: null,
                id: new Uuid(4).format(),
                widgetID,
                orderID: this.nextOrderID(),
                isCanceled: false
            };

            // Mounted widgets are stored in a hash. This allows multiple concurrent
            // mounting, although in the end only the most recent one will be rendered.
            this.mountedWidgets[mountedWidget.id] = mountedWidget;

            // This promise sequence walks a widget through it's lifecycle events, feeding
            // whatever arguments are required.
            // It is because this process is asynchronous that we need to accommodate multiple
            // mount requests being active.
            // E.g. during this sequence, a user may click on another nav item.
            // In that case, this
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
                    // Ensure that in the case another widget has been mounted after this one,
                    // that this one is simply removed.
                    if (mountedWidget.orderID < this.orderID) {
                        return this.unmount(mountedWidget);
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
                // First give the widget a chance to stop mounting.
                // Note that this is enabled by the Bluebird promise
                // cancellation capability, which is not available for
                // standard promises.
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
                    .catch((err) => {
                        // ignore errors while un-mounting widgets.
                        console.error('[unmount] ERROR un-mounting widget', err);
                        return null;
                    })
                    .finally(() => {
                        // ensure that a misbehaving widget is actually removed from the DOM.
                        if (mountedWidget.container && mountedWidget.container.parentNode) {
                            mountedWidget.container.parentNode.removeChild(mountedWidget.container);
                        }
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
