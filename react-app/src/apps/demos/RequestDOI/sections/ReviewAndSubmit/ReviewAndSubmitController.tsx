import { OSTISubmission, ReviewAndSubmitResult } from "apps/ORCIDLink/ORCIDLinkClient";
import { Component } from "react";
import { Model } from "../../Model";
import ReviewAndSubmitForm from './ReviewAndSubmitForm';

export interface ReviewAndSubmitControllerProps {
    model: Model;
    formId: string;
    submission: OSTISubmission;
    setTitle: (title: string) => void;
    onDone: (result: ReviewAndSubmitResult) => void;
}


interface ReviewAndSubmitControllerState {
    // reviewAndSubmitData: ReviewAndSubmitResult;
}

export default class ReviewAndSubmitController extends Component<ReviewAndSubmitControllerProps, ReviewAndSubmitControllerState> {
    componentDidMount(): void {
        this.props.setTitle('ORCID® Link  - Demos - DOI Form - Step 8: Review and Submit');
    }

    async onDone() {
        // TODO:

        // Submit to OSTI
        const result = await this.props.model.submitDOIRequest(this.props.formId, this.props.submission)


        // Record the request id
        return this.props.onDone({ formId: this.props.formId, requestId: result.request_id });
    }
    render() {
        return <ReviewAndSubmitForm
            submission={this.props.submission}
            onDone={() => {
                // this.props.onDone(this.state.reviewAndSubmitData);
                this.onDone();
            }} />
    }
}
