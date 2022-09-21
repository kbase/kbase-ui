import { Model, } from "apps/ORCIDLink/Model";
import { Description } from "apps/ORCIDLink/ORCIDLinkClient";
import { Component } from "react";
import DescriptionForm from './Form';

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
    addKeyword(keyword: string) {
        const keywords = this.state.description.keywords.slice();
        keywords.push(keyword);
        this.setState({
            description: {
                ...this.state.description,
                keywords
            }
        })
    }

    removeKeyword(position: number) {
        const keywords = this.state.description.keywords.slice();
        keywords.splice(position, 1);
        this.setState({
            description: {
                ...this.state.description,
                keywords
            }
        })
    }

    render() {
        return <DescriptionForm
            description={this.state.description}
            addKeyword={this.addKeyword.bind(this)}
            removeKeyword={this.removeKeyword.bind(this)}
            onDone={() => { this.props.onDone(this.state.description) }} />
    }
}
