import Empty from 'components/Empty';
import Well from 'components/Well';
import { Component } from 'react';
import { Button, Col, Form, FormControl, Row, Stack } from 'react-bootstrap';
import { EditableContractNumbers } from './ContractNumbersFormController';

export interface ContractNumbersFormProps {
    contractNumbers: EditableContractNumbers;
    addDOEContractNumber: () => void;
    removeDOEContractNumber: (index: number) => void;
    updateDOEContractNumber: (index: number, contractNumber: string) => void;
    addOtherContractNumber: () => void;
    removeOtherContractNumber: (index: number) => void;
    updateOtherContractNumber: (index: number, contractNumber: string) => void;
    onDone: () => void;
}

export default class ContractNumbersForm extends Component<ContractNumbersFormProps> {
    constructor(props: ContractNumbersFormProps) {
        super(props);
    }

    renderDOEForm() {
        const rows = (() => {
            if (this.props.contractNumbers.doe.length === 0) {
                return <Empty message="No DOE contract numbers" />;
            }
            return this.props.contractNumbers.doe.map(
                ({ autoFocus, value: contractNumber }, index) => {
                    return (
                        <Stack key={index}>
                            <Form.Group as={Row} className="gx-0">
                                <Col>
                                    <FormControl
                                        type="text"
                                        value={contractNumber}
                                        autoFocus={autoFocus}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                this.props.addDOEContractNumber();
                                            }
                                        }}
                                        onInput={(e) => {
                                            this.props.updateDOEContractNumber(
                                                index,
                                                e.currentTarget.value
                                            );
                                        }}
                                    />
                                </Col>
                                <Col md="auto">
                                    <Button
                                        variant="outline-danger border-0"
                                        onClick={() => this.props.removeDOEContractNumber(index)}
                                    >
                                        <span className="fa fa-trash" />
                                    </Button>
                                </Col>
                            </Form.Group>
                        </Stack>
                    );
                }
            );
        })();

        return (
            <Stack gap={2}>
                {rows}
                <Row style={{ justifyContent: 'center' }}>
                    <Button
                        variant="primary"
                        className="w-auto"
                        onClick={() => this.props.addDOEContractNumber()}
                    >
                        <span className="fa fa-plus" /> Add
                    </Button>
                </Row>
            </Stack>
        );
    }

    renderOtherForm() {
        const rows = (() => {
            if (this.props.contractNumbers.other.length === 0) {
                return <Empty message="No non-DOE contract numbers" />;
            }
            return this.props.contractNumbers.other.map(
                ({ autoFocus, value: contractNumber }, index) => {
                    return (
                        <Stack key={index}>
                            <Form.Group as={Row} className="gx-0">
                                <Col>
                                    <FormControl
                                        type="text"
                                        value={contractNumber}
                                        key={Date.now()}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                this.props.addOtherContractNumber();
                                            }
                                        }}
                                        autoFocus={autoFocus}
                                        onInput={(e) => {
                                            this.props.updateOtherContractNumber(
                                                index,
                                                e.currentTarget.value
                                            );
                                        }}
                                    />
                                </Col>
                                <Col md="auto">
                                    <Button
                                        variant="outline-danger"
                                        className="border-0"
                                        onClick={() => this.props.removeOtherContractNumber(index)}
                                    >
                                        <span className="fa fa-trash" />
                                    </Button>
                                </Col>
                            </Form.Group>
                        </Stack>
                    );
                }
            );
        })();

        return (
            <Stack gap={2}>
                {rows}
                <Row style={{ justifyContent: 'center' }}>
                    <Button
                        variant="primary"
                        className="w-auto"
                        onClick={() => this.props.addOtherContractNumber()}
                    >
                        <span className="fa fa-plus" /> Add
                    </Button>
                </Row>
            </Stack>
        );
    }

    render() {
        return (
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
                    <Row>
                        <Col md={12}>
                            <Row style={{ justifyContent: 'center' }}>
                                <Button
                                    variant="primary"
                                    className="w-auto"
                                    onClick={this.props.onDone}
                                >
                                    Next <span className="fa fa-hand-o-down" />
                                </Button>
                            </Row>
                        </Col>
                    </Row>
                </Stack>
            </Well>
        );
    }
}
