import ErrorAlert from "components/ErrorAlert";
import Loading from "components/Loading";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { SimpleError } from 'lib/SimpleError';
import { Auth2, Identity } from "lib/kb_lib/Auth2";
import { Component } from "react";
import LinkedIdProvidersView from "./view";

import { Providers } from "apps/Auth2/Providers";
import AutoPostForm from "pluginSupport/AutoPostForm";
import ReactDOM from 'react-dom/client';
import { Config, IDProvider } from "types/config";

export interface LinkedIdProvidersControllerProps {
    config: Config;
    token: string;
    authURL: string;
    // params: Record<string, string>;
    setTitle: (title: string) => void;
}

export interface LinkedIdProviders {
    identities: Array<Identity>;
    providers: Array<IDProvider>;
}


type LinkedIdProvidersControllerState = AsyncProcess<LinkedIdProviders, SimpleError>;


export default class LinkedIdProvidersController extends Component<LinkedIdProvidersControllerProps, LinkedIdProvidersControllerState> {
    constructor(props: LinkedIdProvidersControllerProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE
        }
    }

    componentDidMount() {
        this.props.setTitle('Account Manager - Linked Sign-In Accounts');
        this.loadData();
    }


    async unlinkIdentity(identityId: string) {
        if (this.state.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        const auth2 = new Auth2({
            baseUrl: this.props.authURL
        });
        try {
            await auth2.removeLink(this.props.token, {
                identityId
            });
            // this.props.runtime.notifySuccess(
            //     'Successfully unlinked identity',
            //     3000
            // );
            const identities = await this.fetchIdentities();
            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    ...this.state.value,
                    identities
                }
            });
        } catch (ex) {
            console.error(ex);
            // this.props.runtime.notifyError(
            //     `Error unlinking: ${ex.message}`
            // );
        }
    }

    formPost({
        action,
        params,
    }: {
        action: string;
        params: Record<string, string>;
    }) {
        const donorNode = document.createElement('div');
        document.body.appendChild(donorNode);
        const props = {
            action,
            params,
        };
        const root = ReactDOM.createRoot(donorNode);
        root.render(<AutoPostForm {...props} />);
    }

    linkIdentity(providerId: string) {
        try {
            // TODO: routing back into here.
            const params: Record<string, string> = {
                provider: providerId,
                token: this.props.token
            };
            const action = `${this.props.authURL}/link/start`;

            // this.props.runtime.send('app', 'post-form', {
            //     action,
            //     params
            // });

            this.formPost({ action, params });

            // this.auth2.linkStart(this.currentUserToken, {
            //     provider: providerId,
            //     node: this.container
            // });
        } catch (ex) {
            console.error(ex);
            // this.props.runtime.notifyError(
            //     `Error starting the linking process: ${ex.message}`
            // );
        }
    }

    async fetchIdentities() {
        const auth2 = new Auth2({
            baseUrl: this.props.authURL
        });
        const authToken = this.props.token;

        const { idents } = await auth2.getMe(authToken);
        return idents;
    }

    async loadData() {
        this.setState({
            status: AsyncProcessStatus.PENDING
        });

        try {
            const identities = await this.fetchIdentities();
            const providers = new Providers({
                supportedProviders: this.props.config.services.Auth2.supportedProviders,
                providers: this.props.config.services.Auth2.providers
            }).get();

            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    identities, providers
                }
            });
        } catch (ex) {
            this.setState({
                status: AsyncProcessStatus.ERROR,
                error: {
                    message: ex instanceof Error ? ex.message : 'Unknown Error'
                }
            });
        }
    }

    render() {
        switch (this.state.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <Loading message="Loading Linked Sign-In Accounts ..." />
            case AsyncProcessStatus.SUCCESS:
                return <LinkedIdProvidersView
                    providers={this.state.value.providers}
                    identities={this.state.value.identities}
                    linkIdentity={this.linkIdentity.bind(this)}
                    unlinkIdentity={this.unlinkIdentity.bind(this)}
                />
            case AsyncProcessStatus.ERROR:
                return <ErrorAlert message={this.state.error.message} />
        }
    }

}