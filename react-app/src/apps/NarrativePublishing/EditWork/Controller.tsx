import { LinkRecord, Work } from 'apps/ORCIDLink/lib/ORCIDLinkClient';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Config } from 'types/config';
import { EditableWork, Model, workToEditableWork } from '../Model';
import WorkForm from './EditWork';

export interface ControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    putCode: string;
    orcidLink: LinkRecord;
    setTitle: (title: string) => void;
}

export type GetWorkResult = {
    result: Work;
};

export interface DataState {
    work: EditableWork;
}

interface ControllerState {
    dataState: AsyncProcess<DataState, { message: string }>;
}

export default class Controller extends Component<ControllerProps, ControllerState> {
    model: Model;
    constructor(props: ControllerProps) {
        super(props);
        this.model = new Model({ config: this.props.config, auth: this.props.auth });
        this.state = {
            dataState: {
                status: AsyncProcessStatus.NONE,
            },
        };
    }

    // Component Lifecycle

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps: ControllerProps, prevState: ControllerState) {
        if (prevProps.putCode !== this.props.putCode) {
            this.loadData();
        }
    }

    // Model interaction

    async updateWork(updatedWork: EditableWork) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }

        const work = await this.model.saveWork(updatedWork);

        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    work: workToEditableWork(work),
                },
            },
        });
    }

    // TODO: use another async state with REPROCESSING state to handle
    // running the process after success. Hmm, should probably have a similar
    // state for error, but that is quite edgey.
    async reLoadData() {
        await new Promise((resolve) => {
            this.setState(
                {
                    dataState: {
                        status: AsyncProcessStatus.PENDING,
                    },
                },
                () => {
                    resolve(null);
                }
            );
        });
        try {
            const work = await this.model.getEditableWork(this.props.putCode);
            this.setState({
                dataState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: { work },
                },
            });
        } catch (ex) {
            console.error(ex);
            if (ex instanceof Error) {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message,
                        },
                    },
                });
            } else {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: `Unknown error: ${String(ex)}`,
                        },
                    },
                });
            }
        }
    }

    async loadData() {
        await new Promise((resolve) => {
            this.setState(
                {
                    dataState: {
                        status: AsyncProcessStatus.PENDING,
                    },
                },
                () => {
                    resolve(null);
                }
            );
        });
        try {
            const work = await this.model.getEditableWork(this.props.putCode);
            this.setState({
                dataState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: { work },
                },
            });
        } catch (ex) {
            console.error(ex);
            if (ex instanceof Error) {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message,
                        },
                    },
                });
            } else {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: `Unknown error: ${String(ex)}`,
                        },
                    },
                });
            }
        }
    }

    async onDelete(putCode: string) {}

    // Renderers

    renderLoading() {
        return <Loading message="Loading ORCID Work Activity Record ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />;
    }

    renderSuccess(dataState: DataState) {
        return (
            <WorkForm
                work={dataState.work}
                updateWork={this.updateWork.bind(this)}
                // orcidLink={this.props.orcidLink}
            />
        );
    }

    render() {
        switch (this.state.dataState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.dataState.error);
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.dataState.value);
        }
    }
}
