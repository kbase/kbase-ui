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

            if (params.viewParams) {
                params.viewParams = JSON.parse(params.viewParams);
            }
        }

        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', '');
        }

        render() {
            const pluginPath = [
                'modules',
                'plugins',
                this.props.name
            ].join('/');

            const props = {
                runtime: this.props.runtime,
                pluginPath,
                pluginName: this.props.name,
                original: this.props.request.original,
                pipe: this.props.pipe,
                params: {
                    view: this.props.view,
                    originalPath: window.location.pathname,
                    routeParams: this.props.params || {}
                }
            };

            return html`
                <div className="Plugin">
                    <${IFrameController} ...${props}/>
                </div>
            `;
        }
    }

    return Plugin;
});