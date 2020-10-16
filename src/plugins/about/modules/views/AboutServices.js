define([
    'preact',
    'htm',
    '../reactComponents/AboutCoreServices',
    '../reactComponents/AboutDynamicServices',
    'css!./style.css'
], (
    preact,
    htm,
    AboutCoreServices,
    AboutDynamicServices
) => {

    const {h, Component } = preact;
    const html = htm.bind(h);

    class AboutServices extends Component {
        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', 'KBase Core and Dynamic Service Versions and Perf');
        }

        render() {
            return html`
            <div className="View">
                <h2>Core Services</h2>
                <${AboutCoreServices} runtime=${this.props.runtime}/>

                <h2>Dynamic Services</h2>
                <${AboutDynamicServices} runtime=${this.props.runtime} />
            </div>
        `;
        }
    }

    return AboutServices;
});