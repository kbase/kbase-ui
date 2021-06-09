define([
    'preact',
    'htm',
    '../reactComponents/AboutCoreServices',
    '../reactComponents/AboutDynamicServices',
    'reactComponents/Tabs',
    'css!./style.css'
], (
    preact,
    htm,
    AboutCoreServices,
    AboutDynamicServices,
    Tabs
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class AboutServices extends Component {
        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', 'KBase Core and Dynamic Service Versions and Perf');
        }

        render() {
            const tabs = [{
                id: 'coreServices',
                title: 'Core Services',
                component: AboutCoreServices
            }, {
                id: 'dynamicServices',
                title: 'Dynamic Services',
                component: AboutDynamicServices
            }];
            const tabProps = {
                runtime: this.props.runtime
            };
            return html`
                <div className="View">
                    <${Tabs} tabs=${tabs} tabProps=${tabProps} />
                </div>
            `;
        }
    }

    return AboutServices;
});