

import { Model } from 'apps/ORCIDLink/Model';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import DataCiteView from './DataCiteView';

export interface DataCiteViewControllerProps {
    model: Model;
}

export interface DataCiteViewState {
    // citation: Array<Citation>;
    // manualCitations: Array<Citation>;
}

export type AsyncDataState = AsyncProcess<DataCiteViewState, { message: string }>

interface DataCiteViewControllerState {
    dataState: AsyncDataState
}

export default class CitationsController extends Component<DataCiteViewControllerProps, DataCiteViewControllerState> {
    constructor(props: DataCiteViewControllerProps) {
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

            // const citations = await this.props.model.getNarrativeCitations(this.props.narrativeInfo);


            this.setState({
                dataState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        // citations
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

    // async selectNarrative(narrativeId: string): Promise<void> {
    //     if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //         return;
    //     }

    //     const selectedNarrative = this.state.dataState.value.narratives.filter(({ objectInfo: { version }, workspaceInfo: { id } }) => {
    //         return narrativeId === `${id}/${version}`
    //     })[0]!

    //     this.setState({
    //         dataState: {
    //             ...this.state.dataState,
    //             value: {
    //                 ...this.state.dataState.value,
    //                 selectedNarrative
    //             }
    //         }
    //     })
    // }


    // async onImportToForm() {
    //     if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //         return;
    //     }
    //     if (this.state.dataState.value.canImportFromORCID) {
    //         await this.importFromORCID();
    //     }
    //     await this.importFromNarrative();
    // }

    // onNarrativeCitationsUpdate(citations: Array<Citation>) {
    //     if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //         return;
    //     }
    //     this.setState({
    //         dataState: {
    //             ...this.state.dataState,
    //             value: citations
    //         }
    //     });
    // }


    // Renderers

    renderLoading() {
        return <Loading message="Loading your public narratives ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess({ }: DataCiteViewState) {
        const doiCitations: Array<string> = [];

        return <DataCiteView />
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