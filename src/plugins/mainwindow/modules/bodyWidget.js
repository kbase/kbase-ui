define([
    'lib/widget/mount',
    './widgets/widgetFlexContainer'
], function (
    WidgetMount,
    WidgetFlexContainer)
{
    'use strict';

    class BodyWidget extends WidgetFlexContainer {
        constructor(config) {
            super(config);

            this.widgetMount = null;
            this.routeListener = null;
            this.widgetMount = new WidgetMount({
                widgetManager: this.runtime.service('widget').widgetManager,
                runtime: this.runtime,
                node: this.container,
                name: 'body-widget'
            });
        }

        start() {
            // Um, this is where a plugin route is handled.
            this.routeListener = this.runtime.receive('app', 'route-widget', (data) => {
                if (!data.routeHandler.route.widget) {
                    console.warn('No widget in route');
                    return;
                }
                const mounted = this.widgetMount.getCurrentMount();
                if (
                    mounted && mounted.widget &&
                        data.routeHandler.route.widget === mounted.widgetID &&
                        data.routeHandler.route.reentrant
                ) {
                    // If widget is already mounted, just do the run method.
                    // At worst this does nothing.
                    return this.widgetMount.mountedWidget.widget.run(data.routeHandler.params);
                }
                return this.widgetMount
                    .unmountAll()
                    .then(() => {
                        // Clean up any buttons for the next widget.
                        // NOTE: buttons are deprecated, I don't think any plugins use them any longer.
                        return this.runtime.sendp('ui', 'clearButtons');
                    })
                    .then(() => {
                        // Some things are interested in the fact that a new route has been mounted.
                        // E.g. the login widget (upper right corner) becomes disabled if the current
                        // route is #login.
                        this.runtime.send('route', 'routed', {
                            data: data.routeHandler
                        });
                        return this.widgetMount.mount(
                            data.routeHandler.route.widget,
                            data.routeHandler.params
                        );
                    })
                    .catch((err) => {
                        // need a catch-all widget to mount here??
                        console.error('ERROR mounting widget', err, data);
                        return this.widgetMount
                            .unmountAll()
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
