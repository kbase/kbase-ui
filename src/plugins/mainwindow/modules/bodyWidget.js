define(['bluebird', 'lib/widget/mount'], function (Promise, mount) {
    'use strict';

    class BodyWidget {
        constructor(config) {
            this.runtime = config.runtime;

            this.widgetMount = null;
            this.hostNode = null;
            this.container = null;
            this.routeListener = null;
            this.isLoading = false;
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
            this.routeListener = this.runtime.receive('app', 'route-widget', (data) => {
                // console.log('RECEIVED app:route-widget', data);
                // if (this.isLoading) {
                //     console.warn('Already loading, ignoring.');
                //     return;
                // }
                // if (this.isLoading) {
                //     console.log('will abandon');
                // }

                this.isLoading = true;
                Promise.try(() => {

                    if (data.routeHandler.route.widget) {
                        if (
                            this.widgetMount.mountedWidget &&
                            data.routeHandler.route.widget === this.widgetMount.mountedWidget.widgetId &&
                            data.routeHandler.route.reentrant
                        ) {
                            // If widget is already mounted, just do the run method.
                            // At worst this does nothing.
                            this.widgetMount.mountedWidget.widget.run(data.routeHandler.params);
                        } else {
                            return this.widgetMount
                                .unmount()
                                .then(() => {
                                    return this.runtime.sendp('ui', 'clearButtons');
                                })
                                .then(() => {
                                    return this.widgetMount.mount(
                                        data.routeHandler.route.widget,
                                        data.routeHandler.params
                                    );
                                })
                                .catch((err) => {
                                    // need a catch-all widget to mount here??
                                    console.error('ERROR mounting widget', err, data);
                                    return this.widgetMount
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
                }).finally(() => {
                    this.isLoading = false;
                });
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
