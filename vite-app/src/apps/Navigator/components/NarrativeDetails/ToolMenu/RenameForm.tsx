import React, { Component } from 'react';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';

export interface RenameFormProps {
    newName: string;
    rename: (newName: string) => void;
    cancel: () => void;
}

interface RenameFormState {
    newName: string;
}

export default class RenameForm extends Component<
    RenameFormProps,
    RenameFormState
> {
    constructor(props: RenameFormProps) {
        super(props);
        this.state = {
            newName: this.props.newName,
        };
    }

    changeName(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;

        // TODO: do some validation here...

        this.setState({ newName: value });
    }

    onRenameClick() {
        this.props.rename(this.state.newName);
    }

    onCancelClick() {
        this.props.cancel();
    }

    renderBody() {
        return (
            <React.Fragment>
                <Row>
                    <Col>Enter a new name for the Narrative:</Col>
                </Row>
                <Row>
                    <Col>
                        <form className="form">
                            <input
                                className="form-control"
                                type="text"
                                value={this.state.newName}
                                onChange={this.changeName.bind(this)}
                            />
                        </form>
                    </Col>
                </Row>
            </React.Fragment>
        );
    }

    renderFooter() {
        return (
            <React.Fragment>
                <Button
                    onClick={this.onRenameClick.bind(this)}
                    className="me-2"
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        {' '}
                        <span
                            className="fa fa-pencil fa-2x"
                            style={{ marginRight: '0.25em' }}
                        />{' '}
                        Rename
                    </div>
                </Button>
                <Button
                    variant="secondary"
                    onClick={this.onCancelClick.bind(this)}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        {' '}
                        <span
                            className="fa fa-times fa-2x"
                            style={{ marginRight: '0.25em' }}
                        />{' '}
                        Cancel
                    </div>
                </Button>
            </React.Fragment>
        );
    }

    render() {
        return (
            <React.Fragment>
                <Modal.Body>
                    <Container fluid>
                        <Row>
                            <Col>{this.renderBody()}</Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Container fluid>
                        <Row className="justify-content-center">
                            <Col md="auto">{this.renderFooter()}</Col>
                        </Row>
                    </Container>
                </Modal.Footer>
            </React.Fragment>
        );
    }
}
