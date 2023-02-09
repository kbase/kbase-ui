import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Citation, CitationImportResults } from "../../../DOIRequestClient";
import { ImportableCitation, Model, StaticNarrativeSummary } from '../../../Model';
import CitationsImportEditor from './Editor';

export interface CitationsImportControllerProps {
    model: Model;
    staticNarrative: StaticNarrativeSummary;
    setTitle: (title: string) => void;
    onDone: (citations: CitationImportResults) => void;
    onUpdate: (citations: CitationImportResults) => void;
}

export interface CitationState {
    citations: Array<ImportableCitation>;
}

export type DataState = AsyncProcess<CitationState, { message: string }>

interface CitationsImportControllerState {
    dataState: DataState
}

export default class CitationsImportController extends Component<CitationsImportControllerProps, CitationsImportControllerState> {
    constructor(props: CitationsImportControllerProps) {
        super(props);

        this.state = {
            dataState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }

    componentDidMount() {
        this.props.setTitle('DOI Request Form  - 6. Import Citations');
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
            const citations = await this.props.model.getNarrativeCitations(this.props.staticNarrative);
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
        const citations = this.state.dataState.value.citations.concat([citation]);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    citations
                }
            }
        });
        const citationResults: Array<Citation> = [];

        for (const { citation, source, doi } of citations) {
            if (doi) {
                citationResults.push(({ citation, source, doi }));
            }
        }
        this.props.onUpdate({ citations: citationResults });
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
        const citationResults: Array<Citation> = [];

        for (const { citation, source, doi } of citations) {
            if (doi) {
                citationResults.push(({ citation, source, doi }));
            }
        }

        return <CitationsImportEditor
            citations={citations}
            // onUpdate={this.onCitationsUpdate.bind(this)}
            staticNarrative={this.props.staticNarrative}
            // addCitation={this.addCitation.bind(this)}
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