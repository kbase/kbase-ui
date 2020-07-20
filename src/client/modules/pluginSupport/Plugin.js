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
    'use strict';

    const {h, Component } = preact;
    const html = htm.bind(h);

    class Plugin extends Component {
        constructor(props) {
            super(props);
            const {params} = props;
            if (params.viewParams) {
                params.viewParams = JSON.parse(params.viewParams);
            }

            if (typeof params.plugin === 'undefined') {
                throw new Error('Plugin did not pass the plugin name via params');
            }

            self.pluginPath = ['modules', 'plugins', params.plugin].join('/');
        }

        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', '');
        }

        render() {
            const pluginPath = [
                'modules',
                'plugins',
                this.props.params.plugin
            ].join('/');

            const props = {
                runtime: this.props.runtime,
                pluginPath: pluginPath,
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
