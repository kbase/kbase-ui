define([
    'preact',
    'htm',
    'lib/DataPipe',
    'uuid',

    'css!./Body.css'
], (
    preact,
    htm,
    DataPipe,
    Uuid
) => {
    'use strict';

    const {h, Component, createRef, render } = preact;
    const html = htm.bind(h);

    class PluginComponent {
        constructor(pluginName, component) {
            this.pluginName = pluginName;
            this.component = component;
            this.pipe = new DataPipe();
        }
    }

    class Body extends Component {
        constructor(props) {
            super(props);

            this.routeListener = null;
            this.routeComponentListener = null;
            this.nodeRef = createRef();
            this.pluginComponent = null;
        }

        setupForComponent() {
            this.routeComponentListener = this.props.runtime.receive('app', 'route-component', (routed) => {
                const { params, route } = routed.routeHandler;

                if (this.nodeRef.current === null) {
                    return;
                }
                const rootNode = this.nodeRef.current;

                // We don't remount if it is the same plugin and component.
                // But we do if the plugin says so!
                if (this.pluginComponent !== null &&
                    this.pluginComponent.pluginName === params.plugin &&
                    this.pluginComponent.component == route.component &&
                    !route.forceMount) {

                    this.pluginComponent.pipe.put({
                        view: route.view,
                        params
                    });
                    return;
                }

                this.pluginComponent = new PluginComponent(params.plugin, route.component);
                this.pluginComponent.pipe.put({
                    view: route.view,
                    params
                });

                const module = (() => {
                    if (route.component.startsWith('/')) {
                        return route.component.slice(1);
                    } else {
                        return [
                            'plugins',
                            params.plugin,
                            'modules',
                            route.component
                        ].join('/');
                    }
                })();

                require([module], (Component) => {
                    const props = {
                        runtime: this.props.runtime,
                        pipe: this.pluginComponent.pipe,
                        view: route.view,
                        params,
                        key: new Uuid(4).format()
                    };

                    // ensure the root node is empty.
                    while (rootNode.firstChild) {
                        rootNode.removeChild(rootNode.firstChild);
                    }

                    // Then render our component.
                    render(html`<${Component} ...${props}/>`, rootNode);
                });
            });
        }

        componentDidMount() {
            this.setupForComponent();
        }

        componentWillUnmount() {
            if (this.routeListener) {
                this.props.runtime.drop(this.routeListener);
            }
            if (this.routeComponentListener) {
                this.props.runtime.drop(this.routeComponentListener);
            }
        }

        render() {
            return html`
                <div className="Body"
                    ref=${this.nodeRef}
                    data-k-b-testhook-component="body">
                </div>
            `;
        }
    }

    return Body;
});