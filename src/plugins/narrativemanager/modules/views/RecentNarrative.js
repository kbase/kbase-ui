define([
    'preact',
    'htm',
    '../reactComponents/OpenNarrative',
    '../narrativeManager',
    '../reactComponents/Loading',
    '../reactComponents/Error',

    'bootstrap'
], (
    preact,
    htm,
    OpenNarrative,
    NarrativeManagerService,
    Loading,
    Error
) => {
    'use strict';

    const {h, Component } = preact;
    const html = htm.bind(h);

    class OpenNarrativeMain extends Component {
        constructor(props) {
            super(props);
            this.state = {
                isReady: false,
                isError: false,
                data: null,
                error: null
            };
        }

        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', 'Loading Narrative...');
            this.startOrCreateEmptyNarrative()
                .then((result) => {
                    this.setState({
                        isReady: true,
                        isError: false,
                        data: result
                    });
                })
                .catch((ex) => {
                    this.setState({
                        isReady: false,
                        isError: true,
                        error: {
                            message: ex.message
                        }
                    });
                });
        }

        makeNarrativePath(workspaceID) {
            const baseURL = this.props.runtime.config('services.narrative.url');
            return `${baseURL}/narrative/${workspaceID}`;
        }

        startOrCreateEmptyNarrative() {
            const narrativeManager = new NarrativeManagerService({ runtime: this.props.runtime });
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
                            importData: []
                        })
                        .then((result) => {
                            return {
                                url: this.makeNarrativePath(result.narrativeInfo.wsid),
                            };
                        });
                });
        }

        render() {
            if (!this.state.isReady) {
                return html`<${Loading} message="Loading narrative..." />`;
            }
            if (this.state.isError) {
                return html`<${Error} message=${this.state.error.message} />`;
            }

            const props = {
                runtime: this.props.runtime,
                url: this.state.data.url
            };

            return html`<${OpenNarrative} ...${props} />`;
        }
    }

    return OpenNarrativeMain;
});