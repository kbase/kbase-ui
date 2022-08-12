import { Component } from 'react';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { MinimalNarrativeInfo, Model, NarrativeInfo } from 'apps/ORCIDLink/Model';
import SelectNarrative from './SelectNarrative';

export interface SelectNarrativeControllerProps {
    model: Model;
    onDone: (narrative: MinimalNarrativeInfo) => void;
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
            })

            this.setState({
                dataState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        narratives,
                        selectedNarrative: null
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

    async selectNarrative(narrativeId: string): Promise<void> {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }

        const selectedNarrative = this.state.dataState.value.narratives.filter(({ objectInfo: { version }, workspaceInfo: { id } }) => {
            return narrativeId === `${id}/${version}`
        })[0]!

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
        this.props.onDone({
            ref: narrative.objectInfo.ref,
            title: narrative.workspaceInfo.metadata['narrative_nice_name']!
        });
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