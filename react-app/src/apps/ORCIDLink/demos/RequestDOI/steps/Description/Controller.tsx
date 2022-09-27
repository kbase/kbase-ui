import { Model } from "apps/ORCIDLink/Model";
import { Description } from "apps/ORCIDLink/ORCIDLinkClient";
import { Component } from "react";
import DescriptionForm from './Form';

export interface DescriptionControllerProps {
    model: Model;
    setTitle: (title: string) => void;
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
    componentDidMount() {

        this.props.setTitle('ORCID® Link  - Demos - DOI Form - Step 7: Description');
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

    setAbstract(abstract: string) {
        this.setState({
            description: {
                ...this.state.description,
                abstract
            }
        });
    }

    render() {
        return <DescriptionForm
            description={this.state.description}
            addKeyword={this.addKeyword.bind(this)}
            removeKeyword={this.removeKeyword.bind(this)}
            setAbstract={this.setAbstract.bind(this)}
            onDone={() => { this.props.onDone(this.state.description) }} />
    }
}
