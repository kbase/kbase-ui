import { Citation } from 'apps/ORCIDLink/Model';
import { Component } from 'react';
import CitationForm from './CitationForm';
import CrossRefClient, { CrossRefCitation } from './CrossRefClient';

export type CrossRefResponseStatus = 'ok' | 'error';


export interface CrossRefResponseBase {
    status: CrossRefResponseStatus;
}

export interface CrossRefResponseOKBase extends CrossRefResponseBase {
    status: 'ok',
    'message-type': 'work';
    'message-version': string;
}

export interface CrossRefResponseWork extends CrossRefResponseOKBase {
    'message-type': 'work';
    'message': CrossRefCitation;
}

// TODO: sort out error handling.
// Actually ... is there an error response? It looks like status code + text. Hmm..
export interface CrossRefResponseError extends CrossRefResponseBase {
    status: 'error';
    message: string;
}

export type CrossRefResponse = CrossRefResponseWork | CrossRefResponseError;

export interface CitationFormControllerProps {
    addCitation: (citation: Citation) => void;
}

interface CitationFormControllerState {
    citation: CrossRefCitation | null;
}

export default class CitationFormController extends Component<CitationFormControllerProps, CitationFormControllerState> {
    constructor(props: CitationFormControllerProps) {
        super(props);
        this.state = {
            citation: null
        }
    }
    async getCitation(doi: string) {
        const client = new CrossRefClient();
        const citation = await client.getCitation(doi);
        this.setState({ citation });
        // console.log('lookin up ', doi);
        // try {
        //     const response = await fetch(`https://api.crossref.org/works/${doi}`, {
        //         method: 'GET',
        //         // headers: {
        //         //     'Accept': 'application/vnd.crossref-api-message+json',
        //         //     'User-Agent': 'KBase/1.0 (https://kbase.us; mailto:eapearson@lbl.gov)'
        //         // }
        //     });
        //     const data = await response.json() as unknown as CrossRefResponse;
        //     if (data.status === 'ok' && data['message-type'] === 'work') {
        //         this.setState({ citation: data.message })
        //     }
        // } catch (ex) {
        //     console.error('ERROR fetching doi', ex);
        // }
    }

    render() {
        return <CitationForm getCitation={this.getCitation.bind(this)} citation={this.state.citation} onSelect={this.props.addCitation} />
    }
}
