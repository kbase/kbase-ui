define([
    'preact',
    'htm',
    'lib/widget/mount',
    'css!./Body.css'
], (
    preact,
    htm,
    WidgetMount
) => {
    'use strict';

    const {h, Component, createRef } = preact;
    const html = htm.bind(h);

    class Body extends Component {
        constructor(props) {
            super(props);

            this.widgetMount = null;
            this.routeListener = null;
            this.widgetMount = null;
            this.nodeRef = createRef();
        }

        componentDidMount() {
            this.widgetMount = new WidgetMount({
                widgetManager: this.props.runtime.service('widget').widgetManager,
                runtime: this.props.runtime,
                node: this.nodeRef.current,
                name: 'body-widget'
            });
            // The main, heck, only, job of the body widget is to respond to requests
            // to route to a given widget.
            this.routeListener = this.props.runtime.receive('app', 'route-widget', (data) => {
                if (!data.routeHandler.route.widget) {
                    console.warn('No widget in route');
                    return;
                }

                // If widget is already mounted, just do the run method.
                // At worst this does nothing.
                const mounted = this.widgetMount.getCurrentMount();
                if (
                    mounted && mounted.widget &&
                        data.routeHandler.route.widget === mounted.widgetID &&
                        data.routeHandler.route.reentrant
                ) {
                    return this.widgetMount.mountedWidget.widget.run(data.routeHandler.params);
                }

                // This is a tricky async process.
                // First, we ensure that any mounted widgets are removed.
                // Note that mountWidget first removes a mounted widget, then mounts the
                // specified one. In the promise chain below, we use a separate
                // unmountAll followed by a mount, which is exactly what mountWidget does.
                // However, we want to slip some additional behavior in between -
                // to clear any buttons
                return this.widgetMount
                    .unmountAll()
                    .then(() => {
                        // Clean up any buttons for the next widget.
                        // NOTE: buttons are deprecated, I don't think any plugins use them any longer.
                        return this.props.runtime.sendp('ui', 'clearButtons');
                    })
                    .then(() => {
                        // Some things are interested in the fact that a new route has been mounted.
                        // E.g. the login widget (upper right corner) becomes disabled if the current
                        // route is #login.
                        this.props.runtime.send('route', 'routed', {
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

        componentWillUnmount() {
            if (this.routeListener) {
                this.props.runtime.drop(this.routeListener);
            }
        }

        render() {
            return html`
                <div className="Body"
                    ref=${this.nodeRef}
                     data-k-b-testhook-component="logo">
                </div>
            `;
        }
    }

    return Body;
});