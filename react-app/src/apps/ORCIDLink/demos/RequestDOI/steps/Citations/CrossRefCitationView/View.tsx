import AlertMessage from 'components/AlertMessage';
import { Component } from 'react';
import { CrossRefCitation } from '../CrossRefClient';
import CitationComponent from './CitationComponent';
import JournalArticle from './JournalArticle';
import Report from './Report';

export interface CrossRefCitationViewProps {
    citation: CrossRefCitation
}

export default class CrossRefCitationView extends Component<CrossRefCitationViewProps> {
    render() {
        switch (this.props.citation.type) {
            case 'journal-article':
                return <JournalArticle citation={this.props.citation} />
            case 'report':
                return <Report citation={this.props.citation} />
            case 'component':
                return <CitationComponent citation={this.props.citation} />
            default:
                return <AlertMessage type="warning">
                    Sorry, no renderer for citation type {this.props.citation.type}
                </AlertMessage>
        }
    }
}