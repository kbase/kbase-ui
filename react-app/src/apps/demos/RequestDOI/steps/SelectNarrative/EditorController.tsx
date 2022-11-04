import { Model } from 'apps/ORCIDLink/Model';
import { MinimalNarrativeInfo, NarrativeInfo } from 'apps/ORCIDLink/ORCIDLinkClient';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import SelectNarrative from './Editor';

export type EditMode = 'edit' | 'view';

export interface SelectNarrativeControllerProps {
    model: Model;
    selectedNarrative?: MinimalNarrativeInfo | null;
    editMode: EditMode;
    setTitle: (title: string) => void;
    onDone: (narrative: NarrativeInfo) => void;
}

export interface NarrativeSelection {
    narratives: Array<NarrativeInfo>;
    selectedNarrative: NarrativeInfo | null;
}

export type DataState = AsyncProcess<NarrativeSelection, { message: string }>

interface SelectNarrativeControllerState {
    dataState: DataState
}

export default class SelectNarrativeController extends Component<SelectNarrativeControllerProps, SelectNarrativeControllerState> {
    constructor(props: SelectNarrativeControllerProps) {
        super(props);
        this.state = {
            dataState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }

    componentDidMount() {
        this.props.setTitle('ORCID® Link  - Demos - DOI Form - Step 1: Select Narrative');
        this.loadData();
    }

    // Model interaction

    async loadData() {
        await new Promise((resolve) => {
            this.setState({
                dataState: {
                    status: AsyncProcessStatus.PENDING
                }
            }, () => {
                resolve(null);
            });
        });
        try {
            // Get first N narratives.
            // N is ...??
            const pageSize = 20;
            const narratives = await this.props.model.fetchNarratives({
                from: 0,
                to: pageSize
            });

            const selectedNarrative = await (async () => {
                if (!this.props.selectedNarrative) {
                    return null;
                }
                return this.props.model.fetchNarrative(
                    this.props.selectedNarrative.workspaceId,
                    this.props.selectedNarrative.objectId,
                    this.props.selectedNarrative.version
                );
            })();

            this.setState({
                dataState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        narratives,
                        selectedNarrative
                    }
                }
            });
        } catch (ex) {
            if (ex instanceof Error) {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message
                        }
                    }
                });
            } else {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: `Unknown error: ${String(ex)}`
                        }
                    }
                });
            }
        }
    }

    /**
     * Selects the given narrative by setting the state. 
     * 
     * Note that it does not sync with the backend at this point. That is dome when the
     * step is closed by either moving to the next step or the save button is pressed.
     * 
     * @param narrativeId 
     * @returns 
     */
    async selectNarrative(narrativeRef: string): Promise<void> {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }

        const selectedNarrative = this.state.dataState.value.narratives.filter(({ objectInfo: { ref } }) => {
            return narrativeRef === ref
        })[0]!

        // const selectedNarrative: MinimalNarrativeInfo = {
        //     workspaceId, objectId, version, ref, 
        //     title: metadata['narrative_nice_name']
        // }

        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    selectedNarrative
                }
            }
        })
    }

    // Renderers

    renderLoading() {
        return <Loading message="Loading your public narratives ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    onDone(narrative: NarrativeInfo) {
        this.props.onDone(narrative);
    }

    renderSuccess(narrativeSelection: NarrativeSelection) {
        return <SelectNarrative
            narratives={narrativeSelection.narratives}
            selectedNarrative={narrativeSelection.selectedNarrative}
            selectNarrative={this.selectNarrative.bind(this)}
            onDone={() => { this.onDone(narrativeSelection.selectedNarrative!) }}
        />;
    }

    render() {
        switch (this.state.dataState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.dataState.error)
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.dataState.value);
        }
    }
}