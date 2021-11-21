import React, { Component } from 'react';
import NarrativeModel from '../../../utils/NarrativeModel';
import { ControlMenuItemProps } from './ToolMenu';
import Loading from '../../../../../components/Loading';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import GenericClient from '../../../../../lib/kb_lib/comm/JSONRPC11/GenericClient';
import MessageAlert from '../../../../../components/AlertMessage';

export enum DeleteNarrativeStatus {
    NONE = 'NONE',
    LOADING = 'LOADING',
    READY = 'READY',
    DELETING = 'DELETING',
    ERROR = 'ERROR',
    SUCCESS = 'SUCCESS',
}

interface DeleteNarrativeStateBase {
    status: DeleteNarrativeStatus;
}

interface DeleteNarrativeStateNone extends DeleteNarrativeStateBase {
    status: DeleteNarrativeStatus.NONE;
}

interface DeleteNarrativeStateLoading extends DeleteNarrativeStateBase {
    status: DeleteNarrativeStatus.LOADING;
}

interface DeleteNarrativeStateReady extends DeleteNarrativeStateBase {
    status: DeleteNarrativeStatus.READY;
}

interface DeleteNarrativeStateDeleting extends DeleteNarrativeStateBase {
    status: DeleteNarrativeStatus.DELETING;
}

interface DeleteNarrativeStateError extends DeleteNarrativeStateBase {
    status: DeleteNarrativeStatus.ERROR;
    error: {
        message: string | Array<string>;
    };
}

interface DeleteNarrativeStateSuccess extends DeleteNarrativeStateBase {
    status: DeleteNarrativeStatus.SUCCESS;
}

type DeleteNarrativeState =
    | DeleteNarrativeStateNone
    | DeleteNarrativeStateLoading
    | DeleteNarrativeStateReady
    | DeleteNarrativeStateDeleting
    | DeleteNarrativeStateError
    | DeleteNarrativeStateSuccess;

export default class DeleteNarrative extends Component<
    ControlMenuItemProps,
    DeleteNarrativeState
> {
    constructor(props: ControlMenuItemProps) {
        super(props);
        this.state = {
            status: DeleteNarrativeStatus.NONE,
        };
    }

    async componentDidMount() {
        this.setState({
            status: DeleteNarrativeStatus.LOADING,
        });
        try {
            const client = new NarrativeModel({
                workspaceURL: this.props.config.services.Workspace.url,
                token: this.props.authInfo.token,
            });
            const perm = await client.getUserPermission(
                this.props.narrative.access_group,
                this.props.authInfo.account.user
            );
            if (perm === 'a') {
                this.setState({
                    status: DeleteNarrativeStatus.READY,
                });
            } else {
                this.setState({
                    status: DeleteNarrativeStatus.ERROR,
                    error: {
                        message:
                            'You do not have permission to delete this Narrative.',
                    },
                });
            }
        } catch (ex) {
            // TODO: [SCT-2923] the underlying exception does not provide a message!
            // This comes from a KBase jsonrpc client.
            this.setState({
                status: DeleteNarrativeStatus.ERROR,
                error: {
                    message: [
                        'This Narrative has already been deleted.',
                        'The display may take up to 30 seconds to reflect a prior Narrative deletion.',
                        'You may click the Refresh button to immediately conduct a fresh search, but the deleted narrative may still persist for up to 30 seconds.',
                    ],
                },
            });
        }
    }

    async doDelete() {
        this.setState({
            status: DeleteNarrativeStatus.DELETING,
        });

        const workspaceClient = new GenericClient({
            module: 'Workspace',
            url: this.props.config.services.Workspace.url,
            token: this.props.authInfo.token,
            timeout: 1000,
        });
        try {
            await workspaceClient.callFuncEmptyResult('delete_workspace', [
                { id: this.props.narrative.access_group },
            ]);
            this.setState({
                status: DeleteNarrativeStatus.SUCCESS,
            });
        } catch (error) {
            console.error(error);
            const message = (() => {
                if (error instanceof Error) {
                    return error.message;
                }
                return 'Unknown error';
            })();

            this.setState({
                status: DeleteNarrativeStatus.ERROR,
                error: {
                    message,
                },
            });
        }
    }

    renderError({ error: { message } }: DeleteNarrativeStateError) {
        const messageContent = (() => {
            if (typeof message === 'string') {
                return <p>{message}</p>;
            } else {
                return message.map((message, index) => {
                    return <p key={index}>{message}</p>;
                });
            }
        })();
        return this.renderModal(
            <>
                <div style={{ fontWeight: 'bold', color: 'red' }}>Error</div>
                {messageContent}
            </>
        );
    }

    renderLoading(message: string) {
        return this.renderModal(
            <div style={{ textAlign: 'center' }}>
                <Loading message={message} />
            </div>
        );
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

    renderSuccess() {
        return this.renderModal(
            <Row>
                <Col>
                    <MessageAlert type="success">
                        <p>The Narrative has been successfully deleted.</p>
                        <p>
                            It may take several seconds for this to be reflected
                            in the Navigator.
                        </p>
                    </MessageAlert>
                </Col>
            </Row>,
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

    renderConfirmation() {
        return (
            <React.Fragment>
                <Modal.Body>
                    <Container fluid>
                        <Row>
                            <Col>
                                <p>
                                    Deleting a Narrative will permanently remove
                                    it and all its data.
                                </p>
                                <MessageAlert
                                    type="warning"
                                    message="This action cannot be undone!"
                                />
                            </Col>
                        </Row>
                        <Row style={{ marginTop: '2em' }}>
                            <Col>
                                <p className="fw-bold">
                                    Continue to delete this Narrative?
                                </p>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Container fluid>
                        <Row className="justify-content-center">
                            <Col md="auto">
                                <Button
                                    onClick={() => this.doDelete()}
                                    variant="danger"
                                    className="me-2 btn-labeled"
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <span
                                            className="fa fa-trash fa-2x"
                                            style={{ marginRight: '0.25em' }}
                                        />{' '}
                                        Delete
                                    </div>
                                </Button>
                                <Button
                                    onClick={this.props.cancelFn}
                                    variant="secondary"
                                >
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
                                        Cancel
                                    </div>
                                </Button>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Footer>
            </React.Fragment>
        );
    }

    render() {
        switch (this.state.status) {
            case DeleteNarrativeStatus.NONE:
            case DeleteNarrativeStatus.LOADING:
                return this.renderLoading('Loading');
            case DeleteNarrativeStatus.READY:
                return this.renderConfirmation();
            case DeleteNarrativeStatus.DELETING:
                return this.renderLoading('Deleting');
            case DeleteNarrativeStatus.SUCCESS:
                return this.renderSuccess();
            case DeleteNarrativeStatus.ERROR:
                return this.renderError(this.state);
        }
    }
}
