import { Component } from 'react';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import WorkForm from './EditPublication';
import { EditablePublication, Model, Publication } from 'apps/ORCIDLink/Model';
import workTypesRaw from '../../../data/workTypes2.json';
import { workExternalIdentifierTypes, workRelationshipIdentifiers } from 'apps/ORCIDLink/data';

// Work types
// TODO: move to external file.

export interface WorkType {
    category: string;
    value: string;
    label: string;
    description: string;
}

export interface WorkTypeCategory {
    value: string;
    label: string;
}

export interface WorkTypes {
    categories: Array<WorkTypeCategory>;
    values: Array<WorkType>;
}


export interface WorkTypeCategory2 {
    category: string;
    label: string;
    values: Array<WorkType>
}

export type WorkTypes2 = Array<WorkTypeCategory2>

const workTypes = workTypesRaw as unknown as WorkTypes2;

// Component


export interface ControllerProps {
    model: Model;
    // setTitle: (title: string) => void;
    onClose: () => void;
}

// export enum LinkStatus {
//     NONE = 'NONE',
//     LINKED = 'LINKED'
// }


export type GetWorkResult = {
    result: Publication
};


export interface DataState {
    work: EditablePublication
}


// export type LinkState = AsyncProcess<{ link: LinkInfo | null }, { message: string }>

interface ControllerState {
    dataState: AsyncProcess<DataState, { message: string }>
}

export default class Controller extends Component<ControllerProps, ControllerState> {
    model: Model;
    constructor(props: ControllerProps) {
        super(props);
        this.model = props.model;
        this.state = {
            dataState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }

    componentDidMount() {
        // this.props.setTitle('ORCID® Link Demo - Pre Fill a Form from Profile')
        this.loadData();
    }

    // Model interaction



    // async syncWork(): Promise<void> {
    //     const work = await this.model.getEditableWork(this.props.putCode);
    //     this.setState({
    //         dataState: {
    //             status: AsyncProcessStatus.SUCCESS,
    //             value: { work }
    //         }
    //     });
    // }

    async loadData() {
        this.setState({
            dataState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    work: {
                        putCode: '',
                        title: '',
                        date: '',
                        journal: '',
                        publicationType: '',
                        url: '',
                        externalIds: []
                    }
                }
            }
        })
        // await new Promise((resolve) => {
        //     this.setState({
        //         dataState: {
        //             status: AsyncProcessStatus.PENDING
        //         }
        //     }, () => {
        //         resolve(null);
        //     });
        // });
        // try {
        //     await this.syncWork();
        // } catch (ex) {
        //     if (ex instanceof Error) {
        //         this.setState({
        //             dataState: {
        //                 status: AsyncProcessStatus.ERROR,
        //                 error: {
        //                     message: ex.message
        //                 }
        //             }
        //         });
        //     } else {
        //         this.setState({
        //             dataState: {
        //                 status: AsyncProcessStatus.ERROR,
        //                 error: {
        //                     message: `Unknown error: ${String(ex)}`
        //                 }
        //             }
        //         });
        //     }
        // }
    }


    async onSave(update: EditablePublication) {
        const updatedWork = await this.model.createWork(update);
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
            publication={dataState.work}
            workTypes={workTypes}
            workExternalIdentifierTypes={workExternalIdentifierTypes}
            workRelationshipIdentifiers={workRelationshipIdentifiers}
            onSave={this.onSave.bind(this)}
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