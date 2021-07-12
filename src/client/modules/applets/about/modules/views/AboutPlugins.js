define([
    'preact',
    'htm',
    '../reactComponents/AboutPlugins',
    'json!config/plugins-manifest.json',

    'css!./style.css'
], (
    preact,
    htm,
    AboutPlugins,
    pluginsManifest
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class AboutBuildDriver extends Component {
        render() {
            return html`
            <div className="View">
                <${AboutPlugins} runtime=${this.props.runtime} pluginsManifest=${pluginsManifest}/>
            </div>
            `;
        }
    }

    return AboutBuildDriver;
});