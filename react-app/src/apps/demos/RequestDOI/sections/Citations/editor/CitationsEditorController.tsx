import { AsyncProcess } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Citation, CitationResults } from "../../../DOIRequestClient";
import { Model } from '../../../Model';
import CitationsEditor from './CitationsEditor';

export interface CitationsEditorControllerProps {
    model: Model;
    citations: Array<Citation>;
    setTitle: (title: string) => void;
    onDone: (citations: CitationResults) => void;
    onUpdate: (citations: CitationResults) => void;
}

export interface CitationState {
    citations: Array<Citation>;
}

export type DataState = AsyncProcess<CitationState, { message: string }>

interface CitationsEditorControllerState {
    citations: Array<Citation>
}

export default class CitationsEditorController extends Component<CitationsEditorControllerProps, CitationsEditorControllerState> {
    constructor(props: CitationsEditorControllerProps) {
        super(props);

        this.state = {
            citations: this.props.citations
        }
    }

    componentDidMount() {

        this.props.setTitle('ORCID® Link  - Demos - DOI Form - Citations');
        // this.loadData();
    }

    // Model interaction


    // Actions

    addCitation(citation: Citation) {
        const citations = this.state.citations.concat([citation]);
        this.setState({
            citations
        });
        this.props.onUpdate({ citations });
    }

    deleteCitation(indexToRemove: number) {
        const citations = this.state.citations.filter((citation, index) => {
            return indexToRemove !== index;
        })
        this.setState({
            citations
        });
        this.props.onUpdate({ citations });
    }

    // Renderers

    // renderLoading() {
    //     return <Loading message="Loading your public narratives ..." />;
    // }

    // renderError({ message }: { message: string }) {
    //     return <ErrorAlert message={message} />
    // }

    render() {
        const citations = this.state.citations;
        const citationResults: Array<Citation> = [];

        for (const { citation, source, doi } of citations) {
            if (doi) {
                citationResults.push(({ citation, source, doi }));
            }
        }

        return <CitationsEditor
            citations={citations}
            model={this.props.model}
            // onUpdate={this.onCitationsUpdate.bind(this)}
            addCitation={this.addCitation.bind(this)}
            deleteCitation={this.deleteCitation.bind(this)}
            onDone={() => { this.props.onDone({ citations: citationResults }) }}
        />;
    }
}