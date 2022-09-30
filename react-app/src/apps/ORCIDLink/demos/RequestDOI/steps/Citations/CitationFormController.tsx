import { Citation } from 'apps/ORCIDLink/Model';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import CitationForm from './CitationForm';
import CrossRefClient, { CrossRefCitation } from './CrossRefClient';

export type CrossRefResponseStatus = 'ok' | 'error';


/**
 * This models the response from the CrossRef API
 * 
 * TODO: This is probably a generic structure, which can be used
 * across the API, should we ever make other calls here.
 */
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

/**
 * Async model for getCitation.
 */

export type GetCitationProcess = AsyncProcess<CrossRefCitation, { message: string }>


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
    // citation: CrossRefCitation | null;
    getCitationProcess: GetCitationProcess
}

export default class CitationFormController extends Component<CitationFormControllerProps, CitationFormControllerState> {
    constructor(props: CitationFormControllerProps) {
        super(props);
        this.state = {
            getCitationProcess: {
                status: AsyncProcessStatus.NONE
            }
        }
    }
    async getCitation(doi: string) {
        const client = new CrossRefClient();
        this.setState({
            getCitationProcess: {
                status: AsyncProcessStatus.PENDING
            }
        });
        try {
            const citation = await client.getCitation(doi);
            this.setState({
                getCitationProcess: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: citation
                }
            })
        } catch (ex) {
            this.setState({
                getCitationProcess: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message: ex instanceof Error ? ex.message : 'Unknown Error'
                    }
                }
            });
        }
        // this.setState({ citation });
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
        return <CitationForm getCitation={this.getCitation.bind(this)} citationProcess={this.state.getCitationProcess} onSelect={this.props.addCitation} />
    }
}
