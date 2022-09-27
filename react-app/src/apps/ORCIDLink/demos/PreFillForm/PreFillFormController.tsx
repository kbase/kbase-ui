import { Model } from 'apps/ORCIDLink/Model';
import { ORCIDProfile } from 'apps/ORCIDLink/ORCIDLinkClient';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Config } from 'types/config';
import PreFillForm from './PreFillForm';

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

    async loadData(): Promise<void> {
        await new Promise<void>((resolve) => {
            this.setState({
                dataState: {
                    status: AsyncProcessStatus.PENDING
                }
            }, () => {
                resolve();
            })
        });
        return this.syncProfile();
    }

    async syncProfile(): Promise<void> {
        const model = new Model({
            config: this.props.config,
            auth: this.props.auth
        })
        return new Promise(async (resolve) => {
            try {
                const profile = await model.getProfile();
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: { profile }
                    }
                }, () => {
                    resolve();
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
                    }, () => {
                        resolve();
                    });
                } else {
                    this.setState({
                        dataState: {
                            status: AsyncProcessStatus.ERROR,
                            error: {
                                message: `Unknown error: ${String(ex)}`
                            }
                        }
                    }, () => {
                        resolve();
                    });
                }
            }
        });
    }

    renderLoading() {
        return <Loading message="Loading ORCID Profile..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess(dataState: DataState) {
        return <PreFillForm profile={dataState.profile} syncProfile={this.syncProfile.bind(this)} />
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
