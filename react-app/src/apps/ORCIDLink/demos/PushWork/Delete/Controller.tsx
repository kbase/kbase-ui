import { PushWorksModel } from 'apps/ORCIDLink/demos/PushWork/PushWorksModel';
import { Work } from 'apps/ORCIDLink/ORCIDLinkClient'
import ErrorMessage from 'components/ErrorMessage';
import Loading from 'components/Loading';
import Well from 'components/Well';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react'
import { Button } from 'react-bootstrap';
import DeleteWork from './DeleteWork';

export interface SimpleError {
    message: string;
}

export type DeletionState = AsyncProcess<null, SimpleError>

export interface DeleteWorkControllerProps {
    work: Work;
    model: PushWorksModel;
    onDeleted: () => void;
    onCanceled: () => void;
}

interface DeleteWorkControllerState {
    deletionState: DeletionState;
}

export default class DeleteWorkController extends Component<DeleteWorkControllerProps, DeleteWorkControllerState> {
    constructor(props: DeleteWorkControllerProps) {
        super(props);
        this.state = {
            deletionState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }

    // Actions

    async deleteWork() {
        this.setState({
            deletionState: {
                status: AsyncProcessStatus.PENDING
            }
        })
        try {
            await this.props.model.deleteWork(this.props.work.putCode);
            this.setState({
                deletionState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: null
                }
            });
            this.props.onDeleted();
        } catch (ex) {
            const message = ex instanceof Error ? ex.message : 'Unknown error';
            this.setState({
                deletionState: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message
                    }
                }
            })
        }
    }

    // Renderers

    renderNone() {
        return <DeleteWork work={this.props.work} onCancel={this.props.onCanceled} onDeleteConfirm={this.deleteWork.bind(this)} />
    }

    renderPending() {
        return <Loading message="Deleting work..." />
    }

    renderError(error: SimpleError) {
        return <ErrorMessage message={error.message} />
    }

    renderSuccess() {
        return <Well variant="success">
            <Well.Header>
                Success
            </Well.Header>
            <Well.Body>
                This work was successfully deleted.
            </Well.Body>
            <Well.Footer style={{ justifyContent: 'center' }}>
                <Button variant="primary" onClick={this.props.onCanceled}><span className="fa fa-mail-reply" /> Close</Button>
            </Well.Footer>
        </Well>
    }

    render() {
        switch (this.state.deletionState.status) {
            case AsyncProcessStatus.NONE:
                return this.renderNone();
            case AsyncProcessStatus.PENDING:
                return this.renderPending();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.deletionState.error);
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess();
        }
    }
}