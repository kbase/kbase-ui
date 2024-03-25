import ErrorMessage from "components/ErrorMessage";
import Loading from "components/Loading";
import { RouteProps } from "components/Router2";
import { AuthenticationState, AuthenticationStatus } from "contexts/EuropaContext";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { NextRequestObject } from "lib/NextRequest";
import { SimpleError } from 'lib/SimpleError';
import { navigate2 } from "lib/navigation";
import { Component } from "react";
import { Config } from "types/config";
import { SignInSource, SignInView } from "./SignInView";

export interface SignInParams {
    nextrequest: string;
}

export interface SignInProps extends RouteProps {
    // params: SignInParams
    // nextrequest: string,
    authState: AuthenticationState,
    config: Config,
    source: SignInSource;
    setTitle: (title: string) => void;
}

export interface SignInSuccessState {
    nextRequest: NextRequestObject | null
}

export type SignInState = AsyncProcess<SignInSuccessState, SimpleError>;


export class SignIn extends Component<SignInProps, SignInState> {
    constructor(props: SignInProps) {
        super(props);

        this.state = {
            status: AsyncProcessStatus.NONE
        };
    }

    componentDidMount() {
        this.prepare();
    }

    /**
     * We use this lifecycle call because the sign-in component may be invoked
     * repeatedly without any inetervening route if the user clicks on buttons or links
     * which cause the signin compnent to be rendered for different target paths.
     * 
     * The incoming prop for the hash path will have changed, but this will not
     * naturally cause the re-rendering of the sign in component. We need it to
     * re-render as part of the ui represents the "sign in required" notification which
     * reflects the route the user intended to invoke w/o auth.
     * 
     * Actually, the other approach is now used -- to place a key on the invocation of
     * this component - with that key being the hash path of the target route. That
     * causes this component to be remounted when the hash path changes.
     * 
     * @param prevProps 
     * @param prevState 
     */
    // componentDidUpdate(prevProps: SignInProps, _: SignInState) {
    //     // TODO: should also compare params.
    //     if (prevProps.hashPath.hash !== this.props.hashPath.hash) {
    //         this.prepare();
    //     }
    // }

    getNextRequest(): NextRequestObject | null {
        if (this.props.hashPath.params && Object.keys(this.props.hashPath.params).includes('nextrequest')) {
            return JSON.parse(this.props.hashPath.params['nextrequest']!);
        }
        return null;
    }

    // ?source=authorization&nextrequest=%7B%22realPath%22%3A%22%2F%22%2C%22path%22%3A%5B%22feeds%22%5D%2C%22original%22%3A%22feeds%22%2C%22query%22%3A%7B%7D%7D#login
    async prepare() {
        try {
            this.setState({
                status: AsyncProcessStatus.PENDING
            });

            // If we land here and are logged in already,
            // just go to the "dashboard"
            const nextRequest = this.getNextRequest();

            if (this.props.authState.status === AuthenticationStatus.AUTHENTICATED) {
                if (nextRequest) {
                    // navigate(nextRequest.hash, nextRequest.params);
                    navigate2(nextRequest.path);
                } else {
                    // TODO: navigate to default path...
                    navigate2({path: 'dashboard', type: 'kbaseui'});
                }
                return;
            }

            // await this.cancelLogin();
            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    nextRequest
                }
            });
        } catch (ex) {
            const message = ex instanceof Error ? ex.message : 'Unknown error';
            this.setState({
                status: AsyncProcessStatus.ERROR,
                error: {
                    message
                }
            });
        }
    }

    // async cancelLogin() {
    //     const auth2Client = new auth2.Auth2({
    //         baseUrl: this.props.runtime.config('services.auth.url')
    //     });
    //     try {
    //         await await auth2Client.loginCancel();
    //     } catch (ex) {
    //         if (ex instanceof Auth2Error.AuthError) {
    //             if (ex.code !== '10010') {
    //                 throw ex;
    //             }
    //         }
    //     }
    // }

    renderPending() {
        return <Loading message="Loading ..." />
    }

    renderError(message: string) {
        return <ErrorMessage message={message} />
    }

    renderSuccess({ nextRequest }: SignInSuccessState) {
        const whitelistedProviders = this.props.config.services.Auth2.providers;
        const supportedProviders = this.props.config.services.Auth2.supportedProviders;
        const providers = supportedProviders.filter((({ id }) => {
            return whitelistedProviders.includes(id);
        }));

        // TRY OUR origin
        // const url = new URL(this.props.config.deploy.ui.origin);
        // url.hostname = `legacy.${url.hostname}`;
        // url.hostname = `FOO.${url.hostname}`;
        // const origin = url.origin;

        return <SignInView
            source={this.props.source}
            providers={providers}
            authURL={this.props.config.services.Auth2.url}
            authState={this.props.authState}
            nextRequest={nextRequest || undefined}
            setTitle={this.props.setTitle}
        />
    }

    render() {
        switch (this.state.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderPending();
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.value);
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.error.message);
        }
    }
}
