import { pluralize } from 'components/common';
import Empty from 'components/Empty';
import Well from 'components/Well';
import { Component } from 'react';
import { Accordion, Col, Form, Row, Stack } from 'react-bootstrap';
import { ContractNumbers } from '../../../DOIRequestClient';

export interface ContractNumbersViewProps {
    contractNumbers: ContractNumbers;
}

export default class ContractNumbersView extends Component<ContractNumbersViewProps> {
    renderDOEForm() {
        const rows = (() => {
            if (this.props.contractNumbers.doe.length === 0) {
                return <Empty message="No DOE contract numbers" />;
            }
            return this.props.contractNumbers.doe.map((contractNumber, index) => {
                return (
                    <Row key={index}>
                        <Col>
                            <Form.Group as={Row}>
                                <Col>
                                    <div>{contractNumber}</div>
                                </Col>
                            </Form.Group>
                        </Col>
                    </Row>
                );
            });
        })();

        return <Stack gap={2}>{rows}</Stack>;
    }

    renderOtherForm() {
        const rows = (() => {
            if (this.props.contractNumbers.other.length === 0) {
                return <Empty message="No non-DOE contract numbers" />;
            }
            return this.props.contractNumbers.other.map((contractNumber, index) => {
                return (
                    <Row key={index}>
                        <Col>
                            <Form.Group as={Row}>
                                <Col>{contractNumber}</Col>
                            </Form.Group>
                        </Col>
                    </Row>
                );
            });
        })();

        return <Stack gap={2}>{rows}</Stack>;
    }

    render() {
        const { doe, other } = this.props.contractNumbers;
        return (
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>
                        {pluralize(doe.length, 'DOE contract')},{' '}
                        {pluralize(other.length, 'Other contract')}
                    </Accordion.Header>
                    <Accordion.Body>
                        <Well style={{ padding: '1em', marginBottom: '1em' }} variant="secondary">
                            <Stack gap={2}>
                                <Row>
                                    <Col md={6}>
                                        <h3>DOE Contract Numbers</h3>
                                        {this.renderDOEForm()}
                                    </Col>
                                    <Col md={6}>
                                        <h3>Other Contract Numbers</h3>
                                        {this.renderOtherForm()}
                                    </Col>
                                </Row>
                            </Stack>
                        </Well>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        );
    }
}
