import React, { Component, createRef, RefObject } from 'react';
import { ControlMenuItemProps } from './ToolMenu';
import { NarrativeService } from '../../../../../lib/clients/NarrativeService';
import Loading from '../../../../../components/Loading';
import {
    Alert,
    Button,
    Col,
    Container,
    Form,
    Modal,
    Row,
} from 'react-bootstrap';
import MessageAlert from '../../../../../components/AlertMessage';
import ErrorMessage from '../../../../../components/ErrorMessage';

export enum CopyStatus {
    NONE = 'NONE',
    NAME_ERROR = 'NAME_ERROR',
    CAN_COPY = 'CAN_COPY',
    COPYING = 'COPYING',
    COPIED = 'COPIED',
    ERROR = 'ERROR',
}

export interface CopyStateBase {
    status: CopyStatus;
    newName: string;
}

export interface CopyStateNone extends CopyStateBase {
    status: CopyStatus.NONE;
}

export interface CopyStateNameError extends CopyStateBase {
    status: CopyStatus.NAME_ERROR;
    message: string;
}

export interface CopyStateCanCopy extends CopyStateBase {
    status: CopyStatus.CAN_COPY;
}

export interface CopyStateCopying extends CopyStateBase {
    status: CopyStatus.COPYING;
}

export interface CopyStateCopied extends CopyStateBase {
    status: CopyStatus.COPIED;
}

export interface CopyStateError extends CopyStateBase {
    status: CopyStatus.ERROR;
    message: string;
}

export type CopyState =
    | CopyStateNone
    | CopyStateNameError
    | CopyStateCanCopy
    | CopyStateCopying
    | CopyStateCopied
    | CopyStateError;

type CopyItemState = CopyState;

export default class CopyItem extends Component<
    ControlMenuItemProps,
    CopyItemState
> {
    inputRef: RefObject<HTMLInputElement>;
    constructor(props: ControlMenuItemProps) {
        super(props);
        this.inputRef = createRef();
        this.state = {
            status: CopyStatus.NONE,
            newName: this.props.narrative.narrative_title + ' - Copy',
        };
    }

    async makeCopy() {
        this.setState({ ...this.state, status: CopyStatus.COPYING });
        const workspaceId = this.props.narrative.access_group;
        const objectId = this.props.narrative.obj_id;
        const narrativeService = new NarrativeService({
            url: this.props.config.services.ServiceWizard.url,
            token: this.props.authInfo.token,
            timeout: 1000,
        });
        try {
            await narrativeService.copy_narrative({
                workspaceRef: `${workspaceId}/${objectId}`,
                workspaceId: workspaceId,
                newName: this.state.newName,
            });
            this.setState({
                ...this.state,
                status: CopyStatus.COPIED,
            });
        } catch (ex) {
            this.setState({
                ...this.state,
                status: CopyStatus.ERROR,
                message: ex instanceof Error ? ex.message : 'Unknown error',
            });
        }
    }

    componentDidMount() {
        if (this.inputRef.current) {
            this.inputRef.current.focus();
        }
        if (this.state.newName.length > 1) {
            this.setState({
                ...this.state,
                status: CopyStatus.CAN_COPY,
            });
        }
    }

    validateName(event: React.ChangeEvent) {
        const value = (event.target as HTMLInputElement).value;
        if (value.length === 0) {
            this.setState({
                ...this.state,
                status: CopyStatus.NAME_ERROR,
                newName: value,
                message: 'Please enter a name for the new object',
            });
            return;
        }
        this.setState({
            ...this.state,
            status: CopyStatus.CAN_COPY,
            newName: value,
        });
        this.setState({ newName: value || '' });
    }

    renderCopying() {
        return this.renderModal(<Loading message="Copying..." />);
    }

    renderCopied(state: CopyStateCopied) {
        return this.renderModal(
            <MessageAlert type="success">
                <p>
                    Successfully copied this narrative, giving it the name{' '}
                    <b>{state.newName}</b>
                </p>
                <p>
                    Refresh the search results to see the new Narrative; it may
                    take a few seconds for the change to propagate.
                </p>
            </MessageAlert>
        );
    }

    renderNameError(state: CopyStateNameError) {
        return this.renderModal(
            <Alert variant="danger">{state.message}</Alert>
        );
    }

    renderForm(state: CopyStateNone | CopyStateNameError | CopyStateCanCopy) {
        return this.renderModal(
            <React.Fragment>
                <Row style={{ marginBottom: '0.5em' }}>
                    <label>Enter a name for the new Narrative:</label>
                </Row>
                <Row>
                    <Form.Control
                        as="input"
                        type="text"
                        ref={this.inputRef}
                        value={state.newName}
                        onChange={this.validateName.bind(this)}
                    />
                </Row>
                {state.status === CopyStatus.NAME_ERROR
                    ? this.renderNameError(state)
                    : null}
            </React.Fragment>,
            <React.Fragment>
                <Button
                    onClick={this.makeCopy.bind(this)}
                    variant="primary"
                    className="me-2"
                    disabled={state.status !== CopyStatus.CAN_COPY}
                >
                    Copy
                </Button>
                <Button onClick={this.props.cancelFn} variant="danger">
                    Cancel
                </Button>
            </React.Fragment>
        );
    }

    renderError(state: CopyStateError) {
        return this.renderModal(<ErrorMessage message={state.message} />);
    }

    renderCloseButton() {
        return (
            <Button onClick={this.props.cancelFn} variant="secondary">
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    <span
                        className="fa fa-times fa-2x"
                        style={{ marginRight: '0.25em' }}
                    />{' '}
                    Close
                </div>
            </Button>
        );
    }

    renderModal(body: JSX.Element, footer?: JSX.Element) {
        if (!footer) {
            footer = this.renderCloseButton();
        }
        return (
            <React.Fragment>
                <Modal.Body>
                    <Container fluid>
                        <Row>
                            <Col>{body}</Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Container fluid>
                        <Row className="justify-content-center">
                            <Col md="auto">{footer}</Col>
                        </Row>
                    </Container>
                </Modal.Footer>
            </React.Fragment>
        );
    }

    render() {
        switch (this.state.status) {
            case CopyStatus.NONE:
                return this.renderForm(this.state);
            case CopyStatus.NAME_ERROR:
                return this.renderForm(this.state);
            case CopyStatus.CAN_COPY:
                return this.renderForm(this.state);
            case CopyStatus.COPYING:
                return this.renderCopying();
            case CopyStatus.COPIED:
                return this.renderCopied(this.state);
            case CopyStatus.ERROR:
                return this.renderError(this.state);
        }
    }
}
