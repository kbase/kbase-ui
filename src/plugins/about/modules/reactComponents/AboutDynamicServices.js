define([
    'preact',
    'htm',
    'kb_lib/jsonRpc/genericClient',
    './PresentableJSON',
    './Loading',

    'bootstrap'
], (
    preact,
    htm,
    GenericClient,
    PresentableJSON,
    Loading
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class AboutDynamicServices extends Component {
        constructor(props) {
            super(props);
            this.state = {
                loading: true,
                data: null
            };
        }

        componentDidMount() {
            const client = new GenericClient({
                url: this.props.runtime.config('services.service_wizard.url'),
                token: this.props.runtime.service('session').getAuthToken(),
                module: 'ServiceWizard'
            });
            return client
                .callFunc('list_service_status', [
                    {
                        is_up: 0,
                        module_names: ['NarrativeService']
                    }
                ])
                .then(([result]) => {
                    this.setState({
                        loading: false,
                        data: result
                    });
                });
        }

        renderDynamicServices() {
            const params = {
                data: this.state.data
            };
            return html`
                <${PresentableJSON} ...${params}/>
            `;
        }

        render() {
            if (this.state.loading) {
                return html`
                    <${Loading} message="Loading dynamic services..."/>`;
            }
            return this.renderDynamicServices();
        }
    }

    return AboutDynamicServices;
});