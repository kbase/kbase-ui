import { Component } from 'react';
import { Citation } from "../../../DOIRequestClient";

export interface CitationViewProps {
    citation: Citation;
}

interface CitationViewState {
}

export default class CitationView extends Component<CitationViewProps, CitationViewState> {
    render() {
        const citation = this.props.citation
        return <div>
            {citation.citation}
        </div>
    }
}
