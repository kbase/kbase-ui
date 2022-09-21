import { Component } from 'react';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Citations, Model, NarrativeAppCitations } from 'apps/ORCIDLink/Model';
import CitationsForm from './CitationsForm';
import { CitationResults } from 'apps/ORCIDLink/ORCIDLinkClient';

export interface CitationsControllerProps {
    model: Model;
    narrativeObjectRef: string;
    onDone: (citations: CitationResults) => void;
}

export type DataState = AsyncProcess<Citations, { message: string }>

interface CitationsControllerState {
    dataState: DataState
}

export default class CitationsController extends Component<CitationsControllerProps, CitationsControllerState> {
    constructor(props: CitationsControllerProps) {
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

            const narrativeCitations = await this.props.model.getNarrativeCitations(this.props.narrativeObjectRef);


            this.setState({
                dataState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        ...narrativeCitations,
                        manualCitations: []
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

    onCitationsUpdate(citations: Citations) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: citations
            }
        });
    }


    // Renderers

    renderLoading() {
        return <Loading message="Loading your public narratives ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess(citations: Citations) {
        const doiCitations: Array<string> = [];
        for (const tag of ['release', 'beta', 'dev'] as unknown as Array<keyof NarrativeAppCitations>) {
            for (const appCitations of citations.narrativeAppCitations[tag]) {
                for (const { doi } of appCitations.citations) {
                    if (doi) {
                        doiCitations.push(doi);
                    }
                }

            }
        }
        for (const { doi } of citations.markdownCitations) {
            if (doi) {
                doiCitations.push(doi);
            }
        }
        for (const { doi } of citations.manualCitations) {
            if (doi) {
                doiCitations.push(doi);
            }
        }
        return <CitationsForm
            citations={citations}
            onUpdate={this.onCitationsUpdate.bind(this)}
            onDone={() => { this.props.onDone({ citations: doiCitations }) }}
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