import PresentableJSON from 'components/PresentableJSON';
import Well from 'components/Well';
import { JSONValue } from 'lib/json';
import { Component } from 'react';
import { OSTISubmission } from '../DOIRequestClient';

export interface SubmissionProps {
    submission: OSTISubmission;
    requestId: string;
}

interface SubmissionState {}

export default class Submission extends Component<SubmissionProps, SubmissionState> {
    render() {
        return (
            <Well variant="primary">
                <Well.Header>OSTI DOI Submission</Well.Header>
                <Well.Body>
                    <h3>Submission ID</h3>
                    <p>{this.props.requestId}</p>
                    <h3>Request Data</h3>
                    <PresentableJSON data={this.props.submission as unknown as JSONValue} />
                </Well.Body>
            </Well>
        );
    }
}
