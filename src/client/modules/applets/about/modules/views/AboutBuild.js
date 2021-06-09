define([
    'preact',
    'htm',
    '../reactComponents/AboutBuild',
    'css!./style.css',
], (
    preact,
    htm,
    AboutBuild,
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class AboutBuildDriver extends Component {
        render() {
            const buildInfo = this.props.runtime.config('buildInfo');
            return html`
                <div className="View">
                    <${AboutBuild} runtime=${this.props.runtime} buildInfo=${buildInfo}/>
                </div>
            `;
        }
    }

    return AboutBuildDriver;
});