define(['bluebird', 'kb_lib/widget2/mount'], function (Promise, mount) {
    'use strict';

    class BodyWidget {
        constructor(config) {
            this.runtime = config.runtime;

            this.widgetMount = null;
            this.hostNode = null;
            this.container = null;
            this.routeListener = null;
        }

        attach(node) {
            this.hostNode = node;
            this.container = this.hostNode.appendChild(document.createElement('div'));
            this.container.style.display = 'flex';
            this.container.style.flex = '1 1 0px';
            this.container.style['flex-direction'] = 'column';
            this.container.style['overflow-y'] = 'auto';

            this.widgetMount = new mount.WidgetMount({
                widgetManager: this.runtime.service('widget').widgetManager,
                node: this.container
            });
        }

        start() {
            // Um, this is where a plugin route is handled.
            this.routeListener = this.runtime.recv('app', 'route-widget', (data) => {
                if (data.routeHandler.route.widget) {
                    if (
                        this.widgetMount.mountedWidget &&
                        data.routeHandler.route.widget === this.widgetMount.mountedWidget.widgetId &&
                        data.routeHandler.route.reentrant
                    ) {
                        this.widgetMount.mountedWidget.widget.run(data.routeHandler.params);
                    } else {
                        this.widgetMount
                            .unmount()
                            .then(() => {
                                return this.runtime.sendp('ui', 'clearButtons');
                            })
                            .then(() => {
                                return this.widgetMount.mount(data.routeHandler.route.widget, data.routeHandler.params);
                            })
                            .catch((err) => {
                                // need a catch-all widget to mount here??
                                console.error('ERROR mounting widget', err, data);
                                this.widgetMount
                                    .unmount()
                                    .then(() => {
                                        // Note that 'error' is a globally defined widget dependency.
                                        return this.widgetMount.mountWidget('error', {
                                            title: 'ERROR 😞',
                                            error: err
                                        });
                                    })
                                    .catch((err2) => {
                                        console.error('ERROR mounting error widget!');
                                        console.error(err2);
                                        console.error(err);
                                    });
                            });
                    }
                } else {
                    console.warn('No widget in route');
                }
            });
        }

        stop() {
            if (this.routeListener) {
                this.runtime.drop(this.routeListener);
            }
            if (this.hostNode && this.container) {
                this.hostNode.removeChild(this.container);
            }
        }
    }

    return { Widget: BodyWidget };
});
