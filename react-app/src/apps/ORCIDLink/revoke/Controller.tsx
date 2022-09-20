import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { Component } from 'react';
import { Config } from 'types/config';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';

import { Model, ORCIDLinkInfo, ReturnLink } from '../Model';
import ConfirmRevoke from './ConfirmRevoke';
import { changeHash2 } from 'apps/Navigator/utils/navigation';

export interface ControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    setTitle: (title: string) => void;
}


export interface GetNameResult {
    first_name: string;
    last_name: string;
}

export type RevokeResult = null;

export enum RevokeStatus {
    LINKED = "LINKED",
    NOT_LINKED = "NOT_LINKED",
    REVOKED = "REVOKED"
}

export interface RevokeStateBase {
    status: RevokeStatus;
}

export interface RevokeStateLinked extends RevokeStateBase {
    status: RevokeStatus.LINKED;
    link: ORCIDLinkInfo;
}

export interface RevokeStateNotLinked extends RevokeStateBase {
    status: RevokeStatus.NOT_LINKED;
}
export interface RevokeStateRevoked extends RevokeStateBase {
    status: RevokeStatus.REVOKED;
}

export type RevokeState = RevokeStateLinked | RevokeStateNotLinked | RevokeStateRevoked;

export type LinkState = AsyncProcess<{ link: ORCIDLinkInfo | null }, { message: string }>

type ControllerState = AsyncProcess<RevokeState, { message: string }>;

export default class HomeController extends Component<ControllerProps, ControllerState> {
    constructor(props: ControllerProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE
        }
    }

    componentDidMount() {
        this.props.setTitle('ORCID® Link');
        this.loadData();
    }

    async fetchLink(): Promise<ORCIDLinkInfo | null> {
        const model = new Model({ config: this.props.config, auth: this.props.auth });

        const link = await model.getLink();


        if (link === null) {
            return null;
        }

        const {
            created_at,
            orcid_auth: {
                expires_in, name, orcid, scope
            }
        } = link;

        // Name is the one stored from the original linking, may have changed.
        const { first_name, last_name } = await model.getName();

        // normalize for ui:
        return {
            createdAt: created_at,
            expiresAt: Date.now() + expires_in * 1000,
            realname: `${first_name} ${last_name}`,
            orcidID: orcid,
            scope
        }
    }

    // Actions

    async revokeLink() {
        this.setState({
            status: AsyncProcessStatus.PENDING
        });
        const model = new Model({ config: this.props.config, auth: this.props.auth });

        await model.deleteLink();

        this.setState({
            status: AsyncProcessStatus.SUCCESS,
            value: {
                status: RevokeStatus.REVOKED
            }
        });
    }

    cancel() {
        changeHash2("orcidlink");
    }

    // Load state

    async loadData() {
        await new Promise((resolve) => {
            this.setState({
                status: AsyncProcessStatus.PENDING
            }, () => {
                resolve(null);
            });
        });
        try {
            const value = await this.fetchLink();
            if (value === null) {
                this.setState({
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        status: RevokeStatus.NOT_LINKED
                    }
                });
            } else {
                this.setState({
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        status: RevokeStatus.LINKED,
                        link: value
                    }
                });
            }
        } catch (ex) {
            if (ex instanceof Error) {
                this.setState({
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message: ex.message
                    }
                });
            } else {
                this.setState({
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message: `Unknown error: ${String(ex)}`
                    }
                });
            }
        }
    }

    renderLoading() {
        return <Loading />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess(revokeState: RevokeState) {

        return <ConfirmRevoke revokeState={revokeState} revokeLink={this.revokeLink.bind(this)} cancel={this.cancel.bind(this)} />
    }

    render() {
        switch (this.state.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.error);
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.value);
        }
    }
}
