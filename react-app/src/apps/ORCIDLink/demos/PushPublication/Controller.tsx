import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { Component } from 'react';
import { Config } from 'types/config';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import PushPublicationForm from './PushPublicationForm';
import { ORCIDProfile, Model } from 'apps/ORCIDLink/Model';
import { EditablePublication, PushPublicationModel } from './PushPublicationModel';


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
    pushPublicationModel: PushPublicationModel
    model: Model;
    constructor(props: PreFillFormControllerProps) {
        super(props);
        this.pushPublicationModel = new PushPublicationModel({
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
        this.props.setTitle('ORCID® Link Demo - Push DOI Publication to ORCID Account')
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

    async deletePublication(putCodeToDelete: string) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }

        try {
            await this.model.deleteWork(putCodeToDelete)
            const publications = this.state.dataState.value.profile.publications.filter(({ putCode }) => {
                return putCode !== putCodeToDelete;
            });
            this.setState({
                dataState: {
                    ...this.state.dataState,
                    value: {
                        ...this.state.dataState.value,
                        profile: {
                            ...this.state.dataState.value.profile,
                            publications
                        }
                    }
                }
            })
        } catch (ex) {
            console.error('Well, that didn\'t work!', ex);
        }

    }

    async savePublication(updatedPublication: EditablePublication) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }

        const updatedWork = await this.pushPublicationModel.saveWork(updatedPublication);

        const publications = this.state.dataState.value.profile.publications.map((publication) => {
            if (publication.putCode === updatedPublication.putCode.value) {
                return updatedWork;
            }
            return publication;
        });
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    profile: {
                        ...this.state.dataState.value.profile,
                        publications
                    }
                }
            }
        })
    }

    async createPublication(newPublication: EditablePublication) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        const updatedWork = await this.model.createWork(newPublication);

        const publications = {
            ...this.state.dataState.value.profile.publications,
            updatedWork
        }

        console.log('creating?', newPublication, updatedWork, publications);

        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    profile: {
                        ...this.state.dataState.value.profile,
                        publications
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
        return <PushPublicationForm
            model={this.pushPublicationModel}
            profile={dataState.profile}
            syncProfile={this.syncProfile.bind(this)}
            setTitle={this.props.setTitle}
            createPublication={this.createPublication.bind(this)}
            updatePublication={this.savePublication.bind(this)}
            deletePublication={this.deletePublication.bind(this)} />
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
