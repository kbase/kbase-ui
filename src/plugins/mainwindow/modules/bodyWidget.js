define(['bluebird', 'lib/widget/mount'], function(Promise, mount) {
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
                console.log('in route listener');
                if (this.isLoading) {
                    console.warn('Already loading, ignoring.');
                    return;
                }
                console.log('[routeListener] about to try');
                Promise.try(() => {
                    this.isLoading = true;
                    console.log('[routeListener] trying', data.routeHandler);
                    if (data.routeHandler.route.widget) {
                        if (
                            this.widgetMount.mountedWidget &&
                            data.routeHandler.route.widget === this.widgetMount.mountedWidget.widgetId &&
                            data.routeHandler.route.reentrant
                        ) {
                            console.log('[routeListener] running');
                            this.widgetMount.mountedWidget.widget.run(data.routeHandler.params);
                        } else {
                            console.log('[routeListener] mounting');
                            return this.widgetMount
                                .unmount()
                                .then(() => {
                                    return this.runtime.sendp('ui', 'clearButtons');
                                })
                                .then(() => {
                                    console.log('[routeListener] mounting widget');
                                    return this.widgetMount.mount(
                                        data.routeHandler.route.widget,
                                        data.routeHandler.params
                                    );
                                })
                                .then(() => {
                                    console.log('widget mount finished.');
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
                    console.log('loading finished...');
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
