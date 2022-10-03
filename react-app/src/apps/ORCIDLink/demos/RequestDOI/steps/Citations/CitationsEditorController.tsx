import { Citation, Model } from 'apps/ORCIDLink/Model';
import { CitationResult, CitationResults, MinimalNarrativeInfo } from 'apps/ORCIDLink/ORCIDLinkClient';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import CitationsEditor from './CitationsEditor';

export interface CitationsControllerProps {
    model: Model;
    narrativeInfo: MinimalNarrativeInfo;
    setTitle: (title: string) => void;
    onDone: (citations: CitationResults) => void;
}

export interface CitationState {
    citations: Array<Citation>;
}

export type DataState = AsyncProcess<CitationState, { message: string }>

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

        this.props.setTitle('ORCID® Link  - Demos - DOI Form - Step 4: Citations');
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
            const citations = await this.props.model.getNarrativeCitations(this.props.narrativeInfo);
            this.setState({
                dataState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        citations
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

    // Actions

    addCitation(citation: Citation) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    citations: this.state.dataState.value.citations.concat([citation])
                }
            }
        })
    }

    deleteCitation(indexToRemove: number) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    citations: this.state.dataState.value.citations.filter((citation, index) => {
                        return indexToRemove !== index;
                    })
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

    renderSuccess({ citations }: CitationState) {

        const citationResults: Array<CitationResult> = [];

        for (const { citation, source, doi } of citations) {
            if (doi) {
                citationResults.push(({ citation, source, doi }));
            }
        }

        return <CitationsEditor
            citations={citations}
            // onUpdate={this.onCitationsUpdate.bind(this)}
            addCitation={this.addCitation.bind(this)}
            deleteCitation={this.deleteCitation.bind(this)}
            onDone={() => { this.props.onDone({ citations: citationResults }) }}
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