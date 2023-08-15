import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Config } from 'types/config';

import { SimpleError } from 'components/MainWindow';
import { Model } from '../lib/Model';
import { ReturnInstruction } from '../lib/ORCIDLinkClient';
import AlreadyLinked from './AlreadyLinked';
import CreateLink from './CreateLink';

export interface LinkControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    returnInstruction?: ReturnInstruction;
    skipPrompt?: boolean;
    uiOptions?: string;
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

export type StartLinkState = AsyncProcess<true, SimpleError>

interface LinkControllerState {
    linkState: LinkState;
    startLinkState: StartLinkState
    // started: boolean;
}

export default class LinkController extends Component<LinkControllerProps, LinkControllerState> {
    constructor(props: LinkControllerProps) {
        super(props);
        this.state = {
            linkState: {
                status: AsyncProcessStatus.NONE
            },
            startLinkState: { status: AsyncProcessStatus.NONE }
        }
    }

    componentDidMount() {
        this.props.setTitle('ORCID® Link - Create New Link');
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
                expires_in, orcid, scope
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
        this.setState({
            startLinkState: { status: AsyncProcessStatus.PENDING }
        })
        try {
            const model = new Model({ config: this.props.config, auth: this.props.auth });
            await model.startLink({
                returnInstruction: this.props.returnInstruction,
                skipPrompt: this.props.skipPrompt,
                uiOptions: this.props.uiOptions
            })
            this.setState({
                startLinkState: { status: AsyncProcessStatus.SUCCESS, value: true }
            })
        } catch (ex) {
            if (ex instanceof Error) {
                this.setState({
                    startLinkState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message
                        }
                    }
                })
            } else {
                this.setState({
                    startLinkState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: 'Unknown Error'
                        }
                    }
                })
            }
        }
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
        return <Loading message="Loading ORCID Link..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    goBack() {
        window.history.go(-1);
    }

    returnFromWhence() {
        const returnInstruction = this.props.returnInstruction;
        if (typeof returnInstruction !== 'undefined') {
            switch (returnInstruction.type) {
                case 'link':
                    window.open(returnInstruction.url, '_parent');
                    return;
                case 'window':
                    window.opener.postMessage({ id: returnInstruction.id }, window.location.origin);
            }

        } else {
            window.open('https://ci.kbase.us/#orcidlink', '_parent');
        }
    }

    renderSuccess({ link }: { link: LinkInfo | null }) {
        if (link === null) {
            return <CreateLink
                start={this.startLink.bind(this)}
                startLinkState={this.state.startLinkState}
                goBack={this.goBack.bind(this)}
                returnInstruction={this.props.returnInstruction}
                skipPrompt={this.props.skipPrompt}
            />;
        }
        return <AlreadyLinked
            link={link}
            returnInstruction={this.props.returnInstruction}
            returnFromWhence={this.returnFromWhence.bind(this)}
        />;
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
