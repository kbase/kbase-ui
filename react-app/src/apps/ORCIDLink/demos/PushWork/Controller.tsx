import { Model } from 'apps/ORCIDLink/Model';
import { ORCIDProfile } from 'apps/ORCIDLink/ORCIDLinkClient';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Config } from 'types/config';
import PushWorkForm from './PushWorkForm';
import { EditableWork, PushWorksModel } from './PushWorksModel';


export interface PreFillFormControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    setTitle: (title: string) => void;
}

export enum LinkStatus {
    NONE = 'NONE',
    LINKED = 'LINKED'
}

export interface DataState {
    profile: ORCIDProfile
}

// export type LinkState = AsyncProcess<{ link: LinkInfo | null }, { message: string }>

interface PreFillFormControllerState {
    dataState: AsyncProcess<DataState, { message: string }>
}

export default class PreFillFormController extends Component<PreFillFormControllerProps, PreFillFormControllerState> {
    pushWorkModel: PushWorksModel
    model: Model;
    constructor(props: PreFillFormControllerProps) {
        super(props);
        this.pushWorkModel = new PushWorksModel({
            config: this.props.config,
            auth: this.props.auth
        });
        this.model = new Model({
            config: this.props.config,
            auth: this.props.auth
        });
        this.state = {
            dataState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }

    componentDidMount() {
        this.props.setTitle('ORCID® Link Demo - Push DOI Works to ORCID Account')
        this.loadData();
    }


    async syncProfile(): Promise<void> {
        const profile = await this.model.getProfile();

        this.setState({
            dataState: {
                status: AsyncProcessStatus.SUCCESS,
                value: { profile }
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
            await this.syncProfile();
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

    // Actions

    async deleteWork(putCodeToDelete: string) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }

        try {
            await this.model.deleteWork(putCodeToDelete)
            const works = this.state.dataState.value.profile.works.filter(({ putCode }) => {
                return putCode !== putCodeToDelete;
            });
            this.setState({
                dataState: {
                    ...this.state.dataState,
                    value: {
                        ...this.state.dataState.value,
                        profile: {
                            ...this.state.dataState.value.profile,
                            works
                        }
                    }
                }
            })
        } catch (ex) {
            console.error('Well, that didn\'t work!', ex);
        }
    }

    async updateWork(work: EditableWork) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }

        const updatedWork = await this.pushWorkModel.saveWork(work);

        const works = this.state.dataState.value.profile.works.map((work) => {
            if (work.putCode === updatedWork.putCode) {
                return updatedWork;
            }
            return work;
        });
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    profile: {
                        ...this.state.dataState.value.profile,
                        works
                    }
                }
            }
        })
    }

    async createWork(work: EditableWork) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        const newWork = await this.model.createWork(work);

        const works = this.state.dataState.value.profile.works.concat([newWork]);

        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    profile: {
                        ...this.state.dataState.value.profile,
                        works
                    }
                }
            }
        })
    }

    // Renderers

    renderLoading() {
        return <Loading message="Loading ORCID Profile..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess(dataState: DataState) {
        return <PushWorkForm
            model={this.pushWorkModel}
            profile={dataState.profile}
            syncProfile={this.syncProfile.bind(this)}
            setTitle={this.props.setTitle}
            createWork={this.createWork.bind(this)}
            updateWork={this.updateWork.bind(this)}
            deleteWork={this.deleteWork.bind(this)} />
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
