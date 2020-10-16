define([
    'preact',
    'htm',
    './IFrameController',

    'css!./Plugin.css'
], (
    preact,
    htm,
    IFrameController
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class Plugin extends Component {
        constructor(props) {
            super(props);
            const {params} = props;

            // TODO: ummm...
            if (params.viewParams) {
                params.viewParams = JSON.parse(params.viewParams);
            }

            // if (typeof params.plugin === 'undefined') {
            //     throw new Error('Plugin did not pass the plugin name via params');
            // }
            // this.pluginName = props.pluginName;
        }

        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', '');
        }

        render() {
            // TODO: hmm, probably shouldn't assume anything about
            // this plugin path.
            const pluginPath = [
                'modules',
                'plugins',
                this.props.pluginName
            ].join('/');

            const props = {
                runtime: this.props.runtime,
                pluginPath,
                pipe: this.props.pipe,
                params: {
                    view: this.props.view, // +++
                    originalPath: window.location.pathname,
                    routeParams: this.props.params || {}
                }
            };

            return html`
                <div className="Plugin">
                    <${IFrameController} ...${props} />
                </div>
            `;
        }
    }

    return Plugin;
});
