import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Config } from 'types/config';

import { LinkInfo, Model } from '../../ORCIDLink/lib/Model';
// import { ReturnLink } from '../RequestDOI/Model';
import { InfoResult } from 'lib/kb_lib/comm/coreServices/ORCIDLInk';
import Demos from './Home';


export interface HomeControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    // returnLink?: ReturnLink;
    skipPrompt?: boolean;
    setTitle: (title: string) => void;
}

export enum LinkStatus {
    NONE = 'NONE',
    LINKED = 'LINKED'
}

// export interface LinkInfo {
//     createdAt: number;
//     expiresAt: number;
//     realname: string;
//     orcidID: string;
//     scope: string;
// }

export interface GetNameResult {
    first_name: string;
    last_name: string;
}

export type RevokeResult = null;

export interface LinkState {
    link: LinkInfo | null,
    serviceInfo: InfoResult
}

export type LinkStateProcess = AsyncProcess<LinkState, { message: string }>

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
        this.props.setTitle('KBase ORCID® Link - Demos');
        this.loadData();
    }

    async fetchLink(): Promise<LinkInfo | null> {
        const model = new Model({ config: this.props.config, auth: this.props.auth });

        const linkInfo = await model.getLinkInfo();

        return linkInfo;

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
            const model = new Model({ config: this.props.config, auth: this.props.auth });
            const linkInfo = await model.getLinkInfo();
            const serviceInfo = await model.getInfo();

            this.setState({
                linkState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: { link: linkInfo, serviceInfo }
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

    renderSuccess({ link, serviceInfo }: LinkState) {
        return <Demos link={link} orcidSiteURL={serviceInfo.runtime_info.orcid_site_url} />
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
