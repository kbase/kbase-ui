import { Model, Description } from "apps/ORCIDLink/Model";
import { Component } from "react";
import GolocationForm from './DescriptionForm';

export interface DescriptionControllerProps {
    model: Model;
    onDone: (description: Description) => void;
}


interface DescriptionControllerState {
    description: Description;
}

export default class DescriptionController extends Component<DescriptionControllerProps, DescriptionControllerState> {
    constructor(props: DescriptionControllerProps) {
        super(props);
        this.state = {
            description: {
                keywords: [],
                abstract: ''
            }
        }
    }
    render() {
        return <GolocationForm onDone={() => { this.props.onDone(this.state.description) }} />
    }
}
