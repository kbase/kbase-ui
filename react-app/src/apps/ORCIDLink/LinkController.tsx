import { AuthenticationState } from 'contexts/Auth';
import { Component } from 'react';
import { Config } from 'types/config';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import { AsyncProcess, AsyncProcessStatus } from '../../lib/AsyncProcess';

import CreateLink from './CreateLink';
import { LinkRecord } from './Model';
import ViewLink from './ViewLink';

const START_URL = 'https://ci.kbase.us/services/orcidlink/start';
const LINK_URL = 'https://ci.kbase.us/services/orcidlink/link';
const REVOKE_URL = 'https://ci.kbase.us/services/orcidlink/revoke';
const GET_NAME_URL = 'https://ci.kbase.us/services/orcidlink/get_name';

export interface LinkControllerProps {
    config: Config;
    authState: AuthenticationState;
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

export interface LinkInfo {
    createdAt: number;
    expiresAt: number;
    realname: string;
    orcidID: string;
    scope: string;
}

export interface LinkResult {
    link: LinkRecord | null;
}

export interface GetNameResult {
    first_name: string;
    last_name: string;
}

export type RevokeResult = null;


export type LinkState = AsyncProcess<{ link: LinkInfo | null }, { message: string }>

interface LinkControllerState {
    linkState: LinkState
}

export default class LinkController extends Component<LinkControllerProps, LinkControllerState> {
    constructor(props: LinkControllerProps) {
        super(props);
        this.state = {
            linkState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }

    componentDidMount() {
        this.loadData();
    }

    async getName(): Promise<GetNameResult> {
        const response = await fetch(GET_NAME_URL);

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const result = JSON.parse(await response.text()) as { result: GetNameResult };
        return result.result;
    }

    async fetchLink(): Promise<LinkInfo | null> {
        const response = await fetch(LINK_URL);

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const { link } = JSON.parse(await response.text()) as LinkResult;

        if (link === null) {
            return null;
        }

        const {
            created_at,
            orcid_auth: {
                access_token, expires_in, name, orcid, scope
            }
        } = link;

        // Name is the one stored from the original linking, may have changed.
        const { first_name, last_name } = await this.getName();

        // normalize for ui:
        return {
            createdAt: created_at,
            expiresAt: Date.now() + expires_in,
            realname: `${first_name} ${last_name}`,
            orcidID: orcid,
            scope
        }
    }

    async revokeLink() {
        const response = await fetch(REVOKE_URL);

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        this.setState({
            linkState: {
                status: AsyncProcessStatus.SUCCESS,
                value: { link: null }
            }
        });

        // TODO: notification

        return null;
    }

    startLink() {
        window.open(START_URL, '_parent');
    }

    async loadData() {
        await new Promise((resolve) => {
            this.setState({
                linkState: {
                    status: AsyncProcessStatus.PENDING
                }
            }, () => {
                resolve(null);
            });
        });
        try {
            const value = await this.fetchLink();
            this.setState({
                linkState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: { link: value }
                }
            });
        } catch (ex) {
            if (ex instanceof Error) {
                this.setState({
                    linkState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message
                        }
                    }
                });
            } else {
                this.setState({
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

    renderLoading() {
        return <Loading />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess({ link }: { link: LinkInfo | null }) {
        if (link === null) {
            this.props.setTitle('ORCID® Link');
            return <CreateLink start={this.startLink.bind(this)} />;
        }
        this.props.setTitle('ORCID® Link');
        return <ViewLink link={link} revoke={this.revokeLink.bind(this)} />;
    }

    render() {
        switch (this.state.linkState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.linkState.error)
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.linkState.value);
        }
    }
}
