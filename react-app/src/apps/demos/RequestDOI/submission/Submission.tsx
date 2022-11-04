import { OSTISubmission } from "apps/ORCIDLink/ORCIDLinkClient";
import PresentableJSON from "components/PresentableJSON";
import Well from "components/Well";
import { JSONValue } from "lib/json";
import { Component } from "react";

export interface SubmissionProps {
    submission: OSTISubmission;
}

interface SubmissionState {

}

export default class Submission extends Component<SubmissionProps, SubmissionState> {
    render() {
        return <Well>
            <Well.Header>
                OSTI DOI Submission
            </Well.Header>
            <Well.Body>
                <PresentableJSON data={this.props.submission as unknown as JSONValue} />
            </Well.Body>
        </Well>
    }
}