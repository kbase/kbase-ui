import { AuthenticationStateAuthenticated } from 'contexts/EuropaContext';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Config } from 'types/config';

import { navigate } from 'lib/navigation';
import { Model, ORCIDLinkInfo } from '../lib/Model';
import View from './View';

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
    NONE = "NONE",
    LINKED = "LINKED",
    REVOKING = "REVOKING",
    REVOKED = "REVOKED",
    ERROR = "ERROR"
}

export interface RevokeStateBase {
    status: RevokeStatus;
}

// export interface RevokeStateLinked extends RevokeStateBase {
//     status: RevokeStatus.LINKED;
//     link: ORCIDLinkInfo;
// }

// export interface RevokeStateNotLinked extends RevokeStateBase {
//     status: RevokeStatus.NOT_LINKED;
// }
export interface RevokeStateNone extends RevokeStateBase {
    status: RevokeStatus.NONE
}

export interface RevokeStateLinked extends RevokeStateBase {
    status: RevokeStatus.LINKED
    linkInfo: ORCIDLinkInfo
}

export interface RevokeStateRevoked extends RevokeStateBase {
    status: RevokeStatus.REVOKED;
}

export interface RevokeStateRevoking extends RevokeStateBase {
    status: RevokeStatus.REVOKING;
}

export interface RevokeStateError extends RevokeStateBase {
    status: RevokeStatus.ERROR;
    message: string;
}

export type RevokeState = RevokeStateNone | RevokeStateLinked | RevokeStateRevoking | RevokeStateRevoked | RevokeStateError;

export type LinkState = AsyncProcess<ORCIDLinkInfo | null, { message: string }>

// State wrapped in state! 
// The initial async state is for the attempt to load the current link.
// The wrapped state is for the revoking process.
type ControllerState = {
    linkState: LinkState,
    revokeState: RevokeState
}

export default class HomeController extends Component<ControllerProps, ControllerState> {
    constructor(props: ControllerProps) {
        super(props);
        this.state = {
            linkState: {
                status: AsyncProcessStatus.NONE
            },
            revokeState: {
                status: RevokeStatus.NONE
            }
        }
    }

    componentDidMount() {
        this.props.setTitle('KBase ORCID® Link - Revoke');
        this.loadData();
    }

    async fetchLink(): Promise<ORCIDLinkInfo | null> {
        const model = new Model({ config: this.props.config, auth: this.props.auth });

        // We get the link for the authenticated user, which is what this api call
        // is for!

        const link = await model.getLink();

        if (link === null) {
            return null;
        }

        const {
            created_at,
            orcid_auth: {
                expires_in, orcid, scope
            }
        } = link;

        // Name is the one stored from the original linking, may have changed.
        const realname = await model.getRealname();

        // normalize for ui:
        return {
            createdAt: created_at,
            expiresAt: Date.now() + expires_in * 1000,
            realname,
            orcidID: orcid,
            scope
        }
    }

    // Actions

    async revokeLink() {
        if (this.state.revokeState.status !== RevokeStatus.LINKED) {
            return;
        }
        this.setState({
            ...this.state,
            revokeState: {
                status: RevokeStatus.REVOKING
            }
        });

        try {
            const model = new Model({ config: this.props.config, auth: this.props.auth });
            await model.deleteOwnLink();
            await model.removeShowORCIDIdPreference();

            this.setState({
                ...this.state,
                revokeState: {
                    status: RevokeStatus.REVOKED,
                }
            });
        } catch (ex) {
            if (ex instanceof Error) {
                this.setState({
                    ...this.state,
                    revokeState: {
                        status: RevokeStatus.ERROR,
                        message: ex.message
                    }
                })
            } else {
                this.setState({
                    ...this.state,
                    revokeState: {
                        status: RevokeStatus.ERROR,
                        message: 'Unknown error'
                    }
                })
            }
        }
    }

    cancel() {
        navigate("orcidlink");
    }

    // Load state

    async loadData() {
        // await new Promise((resolve) => {
        //     this.setState({
        //         ...this.state,
        //         linkState: {
        //             status: AsyncProcessStatus.PENDING
        //         }
        //     }, () => {
        //         resolve(null);
        //     });
        // });
        this.setState({
            ...this.state,
            linkState: {
                status: AsyncProcessStatus.PENDING
            }
        });
        try {
            const linkInfo = await this.fetchLink();
            if (linkInfo === null) {
                this.setState({
                    ...this.state,
                    linkState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: 'This account does not have a KBase ORCID® Link '
                        }
                    }
                });
            } else {
                this.setState({
                    ...this.state,
                    linkState: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: linkInfo
                    },
                    revokeState: {
                        status: RevokeStatus.LINKED,
                        linkInfo
                    }
                });
            }
        } catch (ex) {
            if (ex instanceof Error) {
                this.setState({
                    ...this.state,
                    linkState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message
                        }
                    }
                });
            } else {
                this.setState({
                    ...this.state,
                    linkState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: `Unknown error: ${String(ex)}`
                        }
                    }
                });
            }
        }
    }

    render() {
        return <View
            linkState={this.state.linkState}
            revokeState={this.state.revokeState}
            revokeLink={this.revokeLink.bind(this)}
            cancel={this.cancel.bind(this)}
            setTitle={this.props.setTitle}
        />
    }
}
