define([
    'preact',
    'htm',
    '../reactComponents/OpenNarrative',
    '../narrativeManager',
    '../reactComponents/Loading',
    '../reactComponents/ErrorAlert',

    'bootstrap',
], (
    preact,
    htm,
    OpenNarrative,
    NarrativeManagerService,
    Loading,
    ErrorAlert,
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class OpenNarrativeMain extends Component {
        constructor(props) {
            super(props);
            this.state = {
                status: null,
                data: null,
                error: null,
            };
        }

        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', 'Loading Narrative...');
            this.setState({
                status: 'creating',
            });
            this.startOrCreateEmptyNarrative()
                .then((result) => {
                    this.setState({
                        status: 'success',
                        data: result,
                    });
                })
                .catch((ex) => {
                    this.setState({
                        status: 'error',
                        error: {
                            message: ex.message,
                        },
                    });
                });
        }

        makeNarrativePath(workspaceID) {
            return `https://${window.location.host}/narrative/${workspaceID}`;
        }

        startOrCreateEmptyNarrative() {
            const narrativeManager = new NarrativeManagerService({runtime: this.props.runtime});
            return narrativeManager.getMostRecentNarrative()
                .then((result) => {
                    if (result) {
                        // we have a last_narrative, so go there
                        return {
                            url: this.makeNarrativePath(result.narrativeInfo.wsid),
                        };
                    }
                    //we need to construct a new narrative- we have a first timer
                    return this.narrativeManager
                        .createTempNarrative({
                            cells: [],
                            parameters: [],
                            importData: [],
                        })
                        .then((result) => {
                            return {
                                url: this.makeNarrativePath(result.narrativeInfo.wsid),
                            };
                        });
                });
        }

        render() {
            switch (this.state.status) {
            case 'creating':
                return html`
                    <${Loading} message="Loading most recently opened narrative..." detectSlow=${true}/>
                `;
            case 'error':
                return html`
                    <${ErrorAlert} title="Error">
                        <p>
                            Sorry, there was an error creating or opening a new narrative:
                        </p>
                        <p>
                            ${this.state.error.message}
                        </p>
                    <//>
                `;
            case 'success':
                var props = {
                    runtime: this.props.runtime,
                    url: this.state.data.url,
                };
                return html`
                    <${OpenNarrative} ...${props}/>`;
            default:
                return html`
                    <${ErrorAlert}>
                        Unexpected status: ${this.state.status}
                    <//>`;
            }
        }
    }

    return OpenNarrativeMain;
});