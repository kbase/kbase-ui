import { Model } from "apps/ORCIDLink/Model";
import { OSTISubmission, ReviewAndSubmitData } from "apps/ORCIDLink/ORCIDLinkClient";
import { Component } from "react";
import ReviewAndSubmitForm from './ReviewAndSubmitForm';

export interface ReviewAndSubmitControllerProps {
    model: Model;
    submission: OSTISubmission;
    setTitle: (title: string) => void;
    onDone: (reviewAndSubmitData: ReviewAndSubmitData) => void;
}


interface ReviewAndSubmitControllerState {
    reviewAndSubmitData: ReviewAndSubmitData;
}

export default class ReviewAndSubmitController extends Component<ReviewAndSubmitControllerProps, ReviewAndSubmitControllerState> {
    constructor(props: ReviewAndSubmitControllerProps) {
        super(props);
        this.state = {
            reviewAndSubmitData: {
                submission: props.submission
            }
        }
    }
    componentDidMount(): void {

        this.props.setTitle('ORCID® Link  - Demos - DOI Form - Step 8: Review and Submit');
    }
    render() {
        return <ReviewAndSubmitForm
            submission={this.props.submission}
            onDone={() => {
                this.props.onDone(this.state.reviewAndSubmitData);
            }} />
    }
}
