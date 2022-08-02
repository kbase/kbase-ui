import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { Component } from 'react';
import { Config } from 'types/config';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import PublicationForm from './PushPublicationForm';
import { ORCIDProfile, Publication } from 'apps/ORCIDLink/Model';

const GET_PROFILE_URL = 'https://ci.kbase.us/services/orcidlink/get_profile';


export interface PreFillFormControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    setTitle: (title: string) => void;
}

export enum LinkStatus {
    NONE = 'NONE',
    LINKED = 'LINKED'
}

export type GetProfileResult = {
    result: ORCIDProfile
};


export interface DataState {
    profile: ORCIDProfile
}


// export type LinkState = AsyncProcess<{ link: LinkInfo | null }, { message: string }>

interface PreFillFormControllerState {
    dataState: AsyncProcess<DataState, { message: string }>
}

export default class PreFillFormController extends Component<PreFillFormControllerProps, PreFillFormControllerState> {
    constructor(props: PreFillFormControllerProps) {
        super(props);
        this.state = {
            dataState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }

    componentDidMount() {
        this.props.setTitle('ORCID® Link Demo - Pre Fill a Form from Profile')
        this.loadData();
    }

    async getProfile(): Promise<ORCIDProfile> {
        const response = await fetch(GET_PROFILE_URL, {
            headers: {
                authorization: this.props.auth.authInfo.token
            }
        });

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const result = JSON.parse(await response.text()) as GetProfileResult;
        return result.result;
    }

    async syncProfile(): Promise<void> {
        const profile = await this.getProfile();

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

    async deletePublication(publication: Publication) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        const publications = this.state.dataState.value.profile.publications.filter(({ putCode }) => {
            console.log('hmm', putCode, publication.putCode);
            return putCode !== publication.putCode;
        });
        console.log('new publications', publications);
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
        return <PublicationForm profile={dataState.profile} syncProfile={this.syncProfile.bind(this)} deletePublication={this.deletePublication.bind(this)} />
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
