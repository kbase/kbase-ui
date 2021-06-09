define([
    'preact',
    'htm',

    'bootstrap',
], (
    preact,
    htm
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class AboutPlugins extends Component {
        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', 'About KBase UI Plugins');
        }

        renderPlugins() {
            return this.props.pluginsManifest
                .sort((pluginA, pluginB) => {
                    return pluginA.name.localeCompare(pluginB.name);
                })
                .map((plugin) => {
                    return html`
                    <tr>
                        <td>
                            ${plugin.name}
                        </td>
                        <td>
                            ${plugin.version}
                        </td>
                        <td>
                            ${Intl.DateTimeFormat('en-US', {}).format(new Date(plugin.gitInfo.committerDate))}
                        </td>
                        <td>
                            ${plugin.gitAccount}
                        </td>
                        <td>
                            <a href="${plugin.url}" target="_blank">${plugin.globalName}</a>
                        </td>
                    </tr>
                `;
                });
        }

        render() {
            return html`
                <div className="AboutPlugins">
                    <table class="table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Version</th>
                            <th>Date</th>
                            <th>Github Account</th>
                            <th>Repo</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${this.renderPlugins()}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }

    return AboutPlugins;
});
