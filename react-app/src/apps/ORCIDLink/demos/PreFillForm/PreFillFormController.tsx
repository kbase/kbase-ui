import { AuthenticationState, AuthenticationStateAuthenticated } from 'contexts/Auth';
import { Component } from 'react';
import { Config } from 'types/config';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import PreFillForm from './PreFillForm';
import { ORCIDProfile } from 'apps/ORCIDLink/Model';

const START_URL = 'https://ci.kbase.us/services/orcidlink/start';
const LINK_URL = 'https://ci.kbase.us/services/orcidlink/link';
const REVOKE_URL = 'https://ci.kbase.us/services/orcidlink/revoke';
const GET_NAME_URL = 'https://ci.kbase.us/services/orcidlink/get_name';
const GET_PROFILE_URL = 'https://ci.kbase.us/services/orcidlink/get_profile';
const GET_RAW_PROFILE_URL = 'https://ci.kbase.us/services/orcidlink/get_raw_profile';


export interface PreFillFormControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    setTitle: (title: string) => void;
}

export enum LinkStatus {
    NONE = 'NONE',
    LINKED = 'LINKED'
}

// export interface LinkBase {
//     kind: LinkStatus
// }

// export interface Linked extends LinkBase {
//     kind: LinkStatus.LINKED;
//     createdAt: number;
//     expiresAt: number;
// }

// export interface NotLinked extends LinkBase {
//     kind: LinkStatus.NONE
// }

// export type Link = Linked | NotLinked;

// export interface LinkInfo {
//     createdAt: number;
//     expiresAt: number;
//     realname: string;
//     orcidID: string;
//     scope: string;
// }

// export interface LinkResult {
//     link: LinkRecord | null;
// }

// export interface GetNameResult {
//     first_name: string;
//     last_name: string;
// }

// export type RevokeResult = null;

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

    renderLoading() {
        return <Loading message="Loading ORCID Profile..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess(dataState: DataState) {
        return <PreFillForm profile={dataState.profile} syncProfile={this.syncProfile.bind(this)} />
        // return <div>Success</div>;
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
