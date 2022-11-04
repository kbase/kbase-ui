import { Model } from 'apps/ORCIDLink/Model';
import { MinimalNarrativeInfo, NarrativeInfo } from 'apps/ORCIDLink/ORCIDLinkClient';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import Viewer from './Viewer';

export interface SelectNarrativeControllerProps {
    model: Model;
    selectedNarrative: MinimalNarrativeInfo;
}

export interface NarrativeSelection {
    selectedNarrative: NarrativeInfo | null;
}

export type DataState = AsyncProcess<NarrativeSelection, { message: string }>

interface SelectNarrativeControllerState {
    dataState: DataState
}

export default class SelectNarrativeViewController extends Component<SelectNarrativeControllerProps, SelectNarrativeControllerState> {
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

    // Renderers

    renderLoading() {
        return <Loading message="Loading your public narratives ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess(narrativeSelection: NarrativeSelection) {
        return <Viewer
            selectedNarrative={narrativeSelection.selectedNarrative}
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