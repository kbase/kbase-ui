import Loading from 'components/Loading';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Config } from 'types/config';

import StandardErrorView, { StandardError } from 'components/StandardErrorView';
import { changeHash2 } from 'lib/navigation';
import { ServiceError } from '../DynamicServiceClient';
import { Model, ReturnLink } from '../Model';
import View from './View';

export interface HomeControllerProps {
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


export type LinkState = AsyncProcess<{ link: LinkInfo | null }, StandardError>

interface HomeControllerState {
    linkState: LinkState
}

export default class HomeController extends Component<HomeControllerProps, HomeControllerState> {
    constructor(props: HomeControllerProps) {
        super(props);
        this.state = {
            linkState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }

    componentDidMount() {
        this.props.setTitle('ORCID® Link');
        this.loadData();
    }

    async fetchLink(): Promise<LinkInfo | null> {
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
        changeHash2('orcidlink/revoke');
        // const model = new Model({ config: this.props.config, auth: this.props.auth });
        // await model.deleteLink();

        // this.setState({
        //     linkState: {
        //         status: AsyncProcessStatus.SUCCESS,
        //         value: { link: null }
        //     }
        // });

        // // TODO: notification

        // return null;
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
           
            if (ex instanceof ServiceError) {
                console.log("error", ex, ex.data)
                this.setState({
                    linkState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            code: ex.code,
                            message: ex.message,
                            title: ex.title || 'Error',
                            data: ex.data
                        }
                    }
                });
            } else if (ex instanceof Error) {
                this.setState({
                    linkState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            code: 'error',
                            message: ex.message,
                            title: 'Error'
                        }
                    }
                });
            } else {
                this.setState({
                    linkState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            code: 'unknown',
                            message: `Unknown error: ${String(ex)}`,
                            title: 'Error'
                        }
                    }
                });
            }
        }
    }

    renderLoading() {
        return <Loading />;
    }

    renderError(error: StandardError) {
        return <StandardErrorView error={error}/>
    }

    renderSuccess({ link }: { link: LinkInfo | null }) {
        return <View link={link} revoke={this.revokeLink.bind(this)} />
        // if (link === null) {
        //     return <Unlinked start={this.startLink.bind(this)} returnLink={this.props.returnLink} skipPrompt={this.props.skipPrompt} />;
        // }
        // return <Linked link={link} revoke={this.revokeLink.bind(this)} />;
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
