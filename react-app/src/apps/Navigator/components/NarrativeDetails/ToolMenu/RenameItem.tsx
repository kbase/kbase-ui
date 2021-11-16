import { Component } from 'react';
import NarrativeModel from '../../../utils/NarrativeModel';
import { NarrativeService } from '../../../../../lib/clients/NarrativeService';
import { ControlMenuItemProps } from './ToolMenu';
import {
    AsyncProcess,
    AsyncProcessStatus,
} from '../../../../../lib/AsyncProcess';
import Loading from '../../../../../components/Loading';
import RenameForm from './RenameForm';
import MessageAlert from '../../../../../components/AlertMessage';
import ErrorMessage from '../../../../../components/ErrorMessage';
import React from 'react';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';

export interface RenameSuccess {
    newName: string;
}

export interface LoadSuccess {
    userPerm: string;
    canRename: boolean;
}

interface RenameItemState {
    loadingState: AsyncProcess<LoadSuccess, string>;
    renameState: AsyncProcess<RenameSuccess, string>;
    newName: string;
}

export default class RenameItem extends Component<
    ControlMenuItemProps,
    RenameItemState
> {
    private currentName: string;

    constructor(props: ControlMenuItemProps) {
        super(props);
        this.currentName = this.props.narrative.narrative_title;
        this.state = {
            loadingState: {
                status: AsyncProcessStatus.NONE,
            },
            renameState: {
                status: AsyncProcessStatus.NONE,
            },
            newName: this.currentName,
        };
    }

    async componentDidMount() {
        try {
            const client = new NarrativeModel({
                token: this.props.authInfo.token,
                workspaceURL: this.props.config.services.Workspace.url,
            });
            const userPerm = await client.getUserPermission(
                this.props.narrative.access_group,
                this.props.authInfo.account.user
            );
            if (userPerm === 'a') {
                this.setState({
                    ...this.state,
                    loadingState: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: {
                            userPerm,
                            canRename: true,
                        },
                    },
                });
            } else {
                throw new Error(
                    'You do not have permission to rename this Narrative'
                );
            }
        } catch (ex) {
            this.setState({
                ...this.state,
                loadingState: {
                    status: AsyncProcessStatus.ERROR,
                    error: ex instanceof Error ? ex.message : 'Unknown error',
                },
            });
        }
    }

    async doRename(newName: string) {
        this.setState({
            ...this.state,
            renameState: {
                status: AsyncProcessStatus.PENDING,
            },
        });
        const wsId = this.props.narrative.access_group;
        const objId = this.props.narrative.obj_id;
        const narrativeService = new NarrativeService({
            url: this.props.config.services.ServiceWizard.url,
            token: this.props.authInfo.token,
            timeout: 1000,
        });
        try {
            await narrativeService.rename_narrative({
                narrative_ref: `${wsId}/${objId}`,
                new_name: this.state.newName,
            });
            this.setState({
                ...this.state,
                renameState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        newName,
                    },
                },
            });
        } catch (ex) {
            this.setState({
                ...this.state,
                renameState: {
                    status: AsyncProcessStatus.ERROR,
                    error: ex instanceof Error ? ex.message : 'Unknown error',
                },
            });
        }
    }

    renderLoading() {
        return this.renderModal(<Loading message="Loading auth status..." />);
    }

    renderLoadError(error: string) {
        return this.renderModal(<ErrorMessage message={error} />);
    }

    renderRenamePending() {
        return this.renderModal(<Loading message="Loading auth status..." />);
    }

    renderRenameError(error: string) {
        return this.renderModal(<ErrorMessage message={error} />);
    }

    renderRenameSuccess({ newName }: RenameSuccess) {
        return this.renderModal(
            <MessageAlert type="success">
                <p>
                    Successfully renamed narrative to <b>{newName}</b>.
                </p>
                <p>
                    Refresh the search results to see the new Narrative; it may
                    take a few seconds for the change to propagate.
                </p>
            </MessageAlert>
        );
    }

    renderRenameForm() {
        return (
            <RenameForm
                newName={this.state.newName}
                rename={this.doRename.bind(this)}
                cancel={this.props.cancelFn!}
            />
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

    render() {
        switch (this.state.loadingState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderLoadError(this.state.loadingState.error);
            case AsyncProcessStatus.SUCCESS:
                switch (this.state.renameState.status) {
                    case AsyncProcessStatus.NONE:
                        return this.renderRenameForm();
                    case AsyncProcessStatus.PENDING:
                        return this.renderRenamePending();
                    case AsyncProcessStatus.ERROR:
                        return this.renderRenameError(
                            this.state.renameState.error
                        );
                    case AsyncProcessStatus.SUCCESS:
                        return this.renderRenameSuccess(
                            this.state.renameState.value
                        );
                }
        }
    }
}
