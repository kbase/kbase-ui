

import { Model } from 'apps/ORCIDLink/Model';
import { OSTISubmission, StepStatus } from 'apps/ORCIDLink/ORCIDLinkClient';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import Submission from './Submission';



export interface SubmissionControllerProps {
    model: Model;
    submissionId: string;
}

export interface SubmissionControllerDataState {
    submission: OSTISubmission;
}

export type DataState = AsyncProcess<SubmissionControllerDataState, { message: string }>

interface SubmissionControllerState {
    dataState: DataState
}

export default class SubmissionController extends Component<SubmissionControllerProps, SubmissionControllerState> {
    constructor(props: SubmissionControllerProps) {
        super(props);

        this.state = {
            dataState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }

    componentDidMount() {
        this.loadData();
    }

    // Model interaction

    async loadData() {
        await new Promise((resolve) => {
            this.setState({
                dataState: {
                    status: AsyncProcessStatus.PENDING
                }
            }, () => {
                resolve(null);
            });
        });
        try {

            // Get first N narratives.
            // N is ...??

            // const narrativeCitations = await this.props.model.getNarrativeCitations(this.props.narrativeObjectRef);
            const submission = await this.props.model.getDOIForm(this.props.submissionId);

            if (submission.steps[7].status !== StepStatus.COMPLETE) {
                throw new Error('Sorry, incomplete submission form, cannot view');
            }

            this.setState({
                dataState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        submission: submission.steps[7].value.submission
                    }
                }
            });
        } catch (ex) {
            if (ex instanceof Error) {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message
                        }
                    }
                });
            } else {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: `Unknown error: ${String(ex)}`
                        }
                    }
                });
            }
        }
    }


    // Renderers

    renderLoading() {
        return <Loading message="Loading your public narratives ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess({ submission }: SubmissionControllerDataState) {
        return <Submission
            submission={submission}

        />;
    }

    render() {
        switch (this.state.dataState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.dataState.error)
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.dataState.value);
        }
    }
}