import { Component } from 'react';
import { Accordion } from 'react-bootstrap';
import { StaticNarrativeSummary } from '../../../Model';
import NarrativeInfoViewer from '../NarrativeInfoViewer';

export interface SelectNarrativeProps {
    selectedNarrative: StaticNarrativeSummary;
}

export default class SelectNarrative extends Component<SelectNarrativeProps> {
    render() {
        return <Accordion>
            <Accordion.Item eventKey="0">
                <Accordion.Header>
                    {this.props.selectedNarrative.title}
                </Accordion.Header>
                <Accordion.Body>
                    <NarrativeInfoViewer narrative={this.props.selectedNarrative} />
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    }
}