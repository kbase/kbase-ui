import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Config } from 'types/config';

import { Model } from '../Model';
import { ReturnLink } from '../ORCIDLinkClient';
import CreateLink from './CreateLink';
import ViewLink from './ViewLink';

export interface LinkControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    returnLink?: ReturnLink;
    skipPrompt?: boolean;
    setTitle: (title: string) => void;
}

export enum LinkStatus {
    NONE = 'NONE',
    LINKED = 'LINKED'
}

export interface LinkInfo {
    createdAt: number;
    expiresAt: number;
    realname: string;
    orcidID: string;
    scope: string;
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
        this.props.setTitle('ORCID® Link - Start Linking Process');
        this.loadData();
    }

    async fetchLink(): Promise<LinkInfo | null> {
        const model = new Model({ config: this.props.config, auth: this.props.auth });

        const isLinked = await model.isLinked();
        if (!isLinked) {
            return null;
        }

        const link = await model.getLink();

        const {
            created_at,
            orcid_auth: {
                expires_in, name, orcid, scope
            }
        } = link;

        // Name is the one stored from the original linking, may have changed.
        const { firstName, lastName } = await model.getName();

        // normalize for ui:
        return {
            createdAt: created_at,
            expiresAt: Date.now() + expires_in * 1000,
            realname: `${firstName} ${lastName}`,
            orcidID: orcid,
            scope
        }
    }

    async revokeLink() {
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        await model.deleteLink();

        this.setState({
            linkState: {
                status: AsyncProcessStatus.SUCCESS,
                value: { link: null }
            }
        });

        // TODO: notification

        return null;
    }

    async startLink() {
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        await model.startLink({ returnLink: this.props.returnLink, skipPrompt: this.props.skipPrompt })
        // const url = new URL(START_URL);
        // if (this.props.returnLink) {
        //     url.searchParams.set('return_link', JSON.stringify(this.props.returnLink));
        // }
        // if (this.props.skipPrompt) {
        //     url.searchParams.set('skip_prompt', 'true');
        // }
        // window.open(url, '_parent');
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

    goBack() {
        window.history.go(-1);
    }

    renderSuccess({ link }: { link: LinkInfo | null }) {
        if (link === null) {
            return <CreateLink start={this.startLink.bind(this)} goBack={this.goBack.bind(this)} returnLink={this.props.returnLink} skipPrompt={this.props.skipPrompt} />;
        }
        return <ViewLink link={link} revoke={this.revokeLink.bind(this)} />;
    }

    render() {
        switch (this.state.linkState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.linkState.error);
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.linkState.value);
        }
    }
}
