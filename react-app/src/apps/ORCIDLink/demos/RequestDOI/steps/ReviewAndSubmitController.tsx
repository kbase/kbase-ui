import { Model, } from "apps/ORCIDLink/Model";
import { ReviewAndSubmitData } from "apps/ORCIDLink/ORCIDLinkClient";
import { Component } from "react";
import ReviewAndSubmitForm from './ReviewAndSubmitForm';

export interface ReviewAndSubmitControllerProps {
    model: Model;
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

            }
        }
    }
    render() {
        return <ReviewAndSubmitForm onDone={() => {
            this.props.onDone(this.state.reviewAndSubmitData);
        }} />
    }
}
