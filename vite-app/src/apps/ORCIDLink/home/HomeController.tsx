import Loading from 'components/Loading';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Config } from 'types/config';

import StandardErrorView, { StandardError } from 'components/StandardErrorView';
import Well from 'components/Well';
import { changeHash2 } from 'lib/navigation';
import { Button } from 'react-bootstrap';
import { LinkInfo, Model } from '../lib/Model';
import { ErrorCode, ReturnInstruction } from '../lib/ORCIDLinkClient';
import { ServiceError } from '../lib/ServiceClient';
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


export type LinkState = AsyncProcess<{ link: LinkInfo | null, url: string, repoURL: string }, StandardError>

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

        const linkInfo = await model.getLinkInfo();
        return linkInfo;

        // // TODO: combine all these calls into 1!
        // //       or at least call them in parallel.

        // const isLinked = await model.isLinked();

        // if (!isLinked) {
        //     return null;
        // }

        // const link = await model.getLink();

        // const {
        //     created_at,
        //     orcid_auth: {
        //         expires_in, orcid, scope
        //     }
        // } = link;

        // // Name is the one stored from the original linking, may have changed.
        // const profile = await model.getProfile();

        // const realname = ((): string => {
        //     if (profile.nameGroup.private) {
        //         return '<private>';
        //     }
        //     const { fields: { firstName, lastName } } = profile.nameGroup;
        //     if (lastName) {
        //         return `${firstName} ${lastName}`
        //     }
        //     return firstName;
        // })();

        // const creditName = ((): string => {
        //     if (profile.nameGroup.private) {
        //         return '<private>';
        //     }
        //     if (!profile.nameGroup.fields.creditName) {
        //         return '<n/a>';
        //     }
        //     return profile.nameGroup.fields.creditName;
        // })();

        // // normalize for ui:
        // return {
        //     createdAt: created_at,
        //     expiresAt: Date.now() + expires_in * 1000,
        //     realname,
        //     creditName,
        //     orcidID: orcid,
        //     scope
        // }
    }

    async getURL(): Promise<string> {
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        return model.getDocURL();
    }

    async getRepoURL(): Promise<string> {
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        const { 'service-description': { repoURL } } = await model.getInfo();
        return repoURL;
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
            await model.deleteLink();
            // changeHash2('orcidlink');
            this.loadData();
        } catch (ex) {
            this.handleError(ex);
        }
    }

    handleError(ex: unknown) {
        if (ex instanceof ServiceError) {
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
            const repoURL = await this.getRepoURL();

            this.setState({
                linkState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: { link: value, url, repoURL }
                }
            });
        } catch (ex) {
            this.handleError(ex);
        }
    }

    renderLoading() {
        return <Loading message="Loading ORCID Link..." />;
    }

    renderError(error: StandardError) {
        switch (error.code) {
            case ErrorCode.authorization_required:
                return <Well variant="danger">
                    <Well.Header>
                        Error
                    </Well.Header>
                    <Well.Body>
                        <p>It appears that your ORCID Account is no longer authorized for KBase
                            access. You may have inadvertently removed permission for KBase, or
                            perhaps you don't wish KBase to have access to your ORCID Account
                            any longer.
                        </p>
                        <p>
                            In any case, the first action you should take to avoid this error
                            message is to remove your ORCID Link. After this, you may create a new
                            ORCID Link when you need it.
                        </p>
                    </Well.Body>
                    <Well.Footer>
                        <Button variant="danger"
                            onClick={this.removeLink.bind(this)} >
                            <span
                                className="fa fa-trash fa-lg"
                                style={{ marginRight: '0.25rem' }}
                            /> Remove ORCID Link
                        </Button>
                    </Well.Footer>
                </Well>
            default:
                return <StandardErrorView error={error} />
        }

    }

    renderSuccess({ link, url, repoURL }: { link: LinkInfo | null, url: string, repoURL: string }) {
        const isDeveloper = this.props.auth.authInfo.account.roles.some((role) => {
            return role.id === 'DevToken'
        });

        const isManager = this.props.auth.authInfo.account.customroles.some((role) => {
            return role === 'orcidlink_admin'
        });

        return <View link={link} revoke={this.revokeLink.bind(this)} isDeveloper={isDeveloper} isManager={isManager} docURL={url} repoURL={repoURL} />
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
