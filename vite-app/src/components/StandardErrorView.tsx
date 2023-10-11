import { JSONValue } from 'lib/json';
import { Component, PropsWithChildren } from 'react';
import { Accordion } from 'react-bootstrap';
import PresentableJSON from './PresentableJSON';
import './StandardErrorView.css';
import Well from './Well';

export interface StandardError {
    code: number;
    message: string;
    title?: string;
    data?: JSONValue;
}

export type StandardErrorViewProps = PropsWithChildren<{
    error: StandardError;
}>;

export default class StandardErrorView extends Component<StandardErrorViewProps> {
    renderTitle() {
        return this.props.error.title || 'Error!';
    }

    renderMessage() {
        return (
            <p>
                {this.props.error.message} ({this.props.error.code})
            </p>
        );
    }

    renderData() {
        if (typeof this.props.error.data === 'undefined') {
            return;
        }

        return (
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Additional Info</Accordion.Header>
                    <Accordion.Body>
                        <PresentableJSON data={this.props.error.data} tableStyle="" />
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        );
    }

    render() {
        return (
            <Well variant="danger">
                <Well.Header>{this.renderTitle()}</Well.Header>
                <Well.Body>
                    {this.renderMessage()}
                    {this.renderData()}
                </Well.Body>
                <Well.Footer></Well.Footer>
            </Well>
        );
    }
}
