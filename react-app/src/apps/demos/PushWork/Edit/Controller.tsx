import { workExternalIdentifierTypes, workRelationshipIdentifiers } from 'apps/ORCIDLink/data';
import { Work } from 'apps/ORCIDLink/lib/ORCIDLinkClient';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import workTypesRaw from '../../../ORCIDLink/data/workTypes2.json';
import { EditableWork, PushWorksModel } from '../PushWorksModel';
import WorkForm from './EditWork';


export interface ControllerProps {
    model: PushWorksModel;
    putCode: string;
    setTitle: (title: string) => void;
    updateWork: (work: EditableWork) => Promise<void>;
    onClose: () => void;
}

// export enum LinkStatus {
//     NONE = 'NONE',
//     LINKED = 'LINKED'
// }


export interface WorkType {
    category: string;
    value: string;
    label: string;
    description: string;
}
export interface WorkTypeCategory2 {
    category: string;
    label: string;
    values: Array<WorkType>
}

export type WorkTypes2 = Array<WorkTypeCategory2>

const workTypes = workTypesRaw as unknown as WorkTypes2;

export type GetWorkResult = {
    result: Work
};


export interface DataState {
    work: EditableWork
}


// export type LinkState = AsyncProcess<{ link: LinkInfo | null }, { message: string }>

interface ControllerState {
    dataState: AsyncProcess<DataState, { message: string }>
}

export default class Controller extends Component<ControllerProps, ControllerState> {
    model: PushWorksModel;
    constructor(props: ControllerProps) {
        super(props);
        this.model = props.model;
        this.state = {
            dataState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }

    // Component Lifecycle

    componentDidMount() {
        // this.props.setTitle('ORCID® Link Demo - Pre Fill a Form from Profile')
        this.loadData();
    }

    componentDidUpdate(prevProps: ControllerProps, prevState: ControllerState) {
        if (prevProps.putCode !== this.props.putCode) {
            this.loadData();
        }
    }

    // Model interaction

    async syncWork(): Promise<void> {
        const work = await this.model.getEditableWork(this.props.putCode);
        this.setState({
            dataState: {
                status: AsyncProcessStatus.SUCCESS,
                value: { work }
            }
        });
    }

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
            await this.syncWork();
        } catch (ex) {
            console.error(ex);
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

    async onDelete(putCode: string) {

    }

    // Renderers

    renderLoading() {
        return <Loading message="Loading ORCID Work Activity Record ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess(dataState: DataState) {
        return <WorkForm
            work={dataState.work}
            workExternalIdentifierTypes={workExternalIdentifierTypes}
            workRelationshipIdentifiers={workRelationshipIdentifiers}
            updateWork={this.props.updateWork}
            workTypes={workTypes}
            onClose={this.props.onClose} />
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