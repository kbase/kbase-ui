import { JSONValue } from 'lib/json';
import { Component, PropsWithChildren } from 'react';
import { Accordion } from 'react-bootstrap';
import PresentableJSON from './PresentableJSON';
import PropTable, { PropTableRow } from './PropTable';
import styles from './StandardErrorView.module.css';
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

    renderInfo() {
        const errorProps: Array<PropTableRow> = [
            ['message', this.props.error.message],
            ['code', String(this.props.error.code)]
        ];

        return <div className={styles.info}>
            <PropTable rows={errorProps} styles={{col1: {flex: '0 0 8rem'}}} />
        </div>;
       
    }

    renderData() {
        if (typeof this.props.error.data === 'undefined') {
            return;
        }

        return (
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Additional Data</Accordion.Header>
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
                    {this.renderInfo()}
                    {this.renderData()}
                </Well.Body>
            </Well>
        );
    }
}
