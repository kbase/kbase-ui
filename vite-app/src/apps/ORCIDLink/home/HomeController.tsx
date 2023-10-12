import Loading from 'components/Loading';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Config } from 'types/config';

import StandardErrorView, { StandardError } from 'components/StandardErrorView';
import Well from 'components/Well';
import { JSONRPC20Exception } from 'lib/kb_lib/comm/JSONRPC20/JSONRPC20';
import { InfoResult } from 'lib/kb_lib/comm/coreServices/ORCIDLInk';
import { changeHash2 } from 'lib/navigation';
import { Button } from 'react-bootstrap';
import { LinkInfo, Model } from '../lib/Model';
import { ErrorCode, ReturnInstruction } from '../lib/ORCIDLinkClient';
import View from './View';

export interface HomeControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    returnInstruction?: ReturnInstruction;
    uiOptions?: string;
    skipPrompt: boolean;
    setTitle: (title: string) => void;
}

export enum LinkStatus {
    NONE = 'NONE',
    LINKED = 'LINKED'
}


export interface GetNameResult {
    first_name: string;
    last_name: string;
}

export type RevokeResult = null;

export interface LinkState {
    link: LinkInfo | null,
    url: string,
    repoURL: string,
    orcid_api_url: string,
    orcid_oauth_url: string
    orcid_site_url: string
}


export type LinkStateProcess = AsyncProcess<LinkState, StandardError>

interface HomeControllerState {
    linkState: LinkStateProcess
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
        this.props.setTitle('KBase ORCID® Link');
        this.loadData();
    }

    async fetchLink(): Promise<LinkInfo | null> {
        const model = new Model({ config: this.props.config, auth: this.props.auth });

        const linkInfo = await model.getLinkInfo();
        return linkInfo;
    }

    async getURL(): Promise<string> {
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        return model.getDocURL();
    }

    async getInfo(): Promise<InfoResult> {
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        return model.getInfo();
    }


    async revokeLink() {
        changeHash2('orcidlink/revoke');
    }

    async startLink() {
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        await model.startLink({ returnInstruction: this.props.returnInstruction, skipPrompt: this.props.skipPrompt, uiOptions: this.props.uiOptions })
    }

    async removeLink() {
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        try {
            await model.deleteOwnLink();
            // changeHash2('orcidlink');
            this.loadData();
        } catch (ex) {
            this.handleError(ex);
        }
    }

    handleError(ex: unknown) {
        if (ex instanceof JSONRPC20Exception) {
            this.setState({
                linkState: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        code: ex.error.code,
                        message: ex.message,
                        title: 'Error',
                        data: ex.error.data
                    }
                }
            });

        } else if (ex instanceof Error) {
            this.setState({
                linkState: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        code: ErrorCode.unknown,
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
                        code: ErrorCode.unknown,
                        message: `Unknown error: ${String(ex)}`,
                        title: 'Error'
                    }
                }
            });
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

            // The user's ORCID Link
            const value = await this.fetchLink();

            // Link to the ORCID Link API Docs
            const url = await this.getURL();

            // Link to the ORCID Link repo
            const {
                'service-description': { repoURL },
                runtime_info: {
                    orcid_api_url, orcid_oauth_url, orcid_site_url
                } } = await this.getInfo();

            this.setState({
                linkState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: { link: value, url, repoURL, orcid_api_url, orcid_oauth_url, orcid_site_url }
                }
            });
        } catch (ex) {
            console.error('ERROR', ex);
            this.handleError(ex);
        }
    }

    renderLoading() {
        return <Loading message="Loading KBase ORCID® Link..." />;
    }

    renderError(error: StandardError) {
        switch (error.code) {
            case ErrorCode.orcid_unauthorized_client:
                return <Well variant="danger">
                    <Well.Header>
                        Error
                    </Well.Header>
                    <Well.Body>
                        <p>It appears that your ORCID® Account is no longer authorized for KBase
                            access. You may have removed permission for KBase from your ORCID account,
                            or a change in the service may have invalidated the link.
                        </p>
                        <p>
                            In any case, the only action you should take to avoid this error
                            message is to remove your KBase ORCID® Link. After this, you may create a new
                            KBase ORCID® Link whenever you wish.
                        </p>
                    </Well.Body>
                    <Well.Footer>
                        <Button variant="danger"
                            onClick={this.removeLink.bind(this)} >
                            <span
                                className="fa fa-trash fa-lg"
                                style={{ marginRight: '0.25rem' }}
                            /> Remove KBase ORCID® Link
                        </Button>
                    </Well.Footer>
                </Well>
            default:
                return <StandardErrorView error={error} />
        }

    }

    renderSuccess({ link, url, repoURL, orcid_site_url }: LinkState) {
        const isDeveloper = this.props.auth.authInfo.account.roles.some((role) => {
            return role.id === 'DevToken'
        });

        const isManager = this.props.auth.authInfo.account.customroles.some((role) => {
            return role === 'orcidlink_admin'
        });

        return <View link={link}
            revoke={this.revokeLink.bind(this)}
            isDeveloper={isDeveloper}
            isManager={isManager}
            docURL={url}
            repoURL={repoURL}
            orcidSiteURL={orcid_site_url}
        />
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
