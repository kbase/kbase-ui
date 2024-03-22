import { AuthenticationState, AuthenticationStatus } from "contexts/EuropaContext";
import { Auth2 } from "lib/kb_lib/Auth2";
import { AuthError } from "lib/kb_lib/Auth2Error";
import { navigate, navigate2 } from "lib/navigation";
import AutoPostForm from "pluginSupport/AutoPostForm";
import { Component } from "react";
import { IDProvider } from "types/config";

import { navigationPathToURL } from "contexts/RouterContext";
import { NextRequestObject } from "lib/NextRequest";
import kbaseLogo from "../resources/images/kbase-logo-99.png";
import SignInControls from "./SignInControls";

/**
 * Sign in can be triggered in two scenarios.
 * 
 * - login          - the user clicks the login button
 * - authentication - the user attempts to access a resource which requires authentication.
 */
export type SignInSource = 'login' | 'authorization';

export interface SignInViewProps {
    source: SignInSource;
    providers: Array<IDProvider>;
    authURL: string;
    authState: AuthenticationState;
    nextRequest?: NextRequestObject;
    setTitle: (title: string) => void;
}

export type SignInMode = 'signup' | 'signin';
export type SignInStatus = 'choosing' | 'go';

export interface SignInStateBase {
    mode: SignInMode
    status: SignInStatus;
}

export interface SignInStateChoosing extends SignInStateBase {
    status: 'choosing'
}

export interface SignInStateSignIn extends SignInStateBase {
    mode: 'signin',
    status: 'go';
    provider: IDProvider;
}

export interface SignInStateSignUp extends SignInStateBase {
    mode: 'signup',
    status: 'go';
    provider: IDProvider;
}

export type SignInState = SignInStateChoosing | SignInStateSignIn | SignInStateSignUp;


interface SignInViewState {
    signInState: SignInState
}

export class SignInView extends Component<SignInViewProps, SignInViewState> {
    constructor(props: SignInViewProps) {
        super(props);
        this.state = {
            signInState: {mode: 'signin', status: 'choosing'}
        }
    }
    componentDidMount() {
        if (!this.possiblyRedirect()) {
            const {mode, status} = this.state.signInState;
            switch (status) {
                case 'choosing':
                    switch (mode) {
                        case 'signin':
                            this.props.setTitle('KBase Sign In');
                            break;
                        case 'signup':
                            this.props.setTitle('Sign Up for KBase');
                            break;
                    }
            }
        }
    }

    async cancelLogin() {
        const auth2Client = new Auth2({
            baseUrl: this.props.authURL
        });
        try {
            await await auth2Client.loginCancel();
        } catch (ex) {
            if (ex instanceof AuthError) {
                if (ex.code !== '10010') {
                    throw ex;
                }
            }
        }
    }

    doRedirect(nextRequest?: NextRequestObject) {
        if (nextRequest) {
            try {
                // const {hash, params} = nextRequest;
                // navigate(hash, {params});
                // this.props.runtime.send('app', 'navigate', nextRequest);
                navigate2(nextRequest.path);
            } catch (ex) {
                navigate('dashboard');
            }
        } else {
            navigate('dashboard');
        }
    }

    possiblyRedirect() {
        // if is logged in, just redirect to the nextrequest,
        // or the nexturl, or dashboard.

        if (this.props.authState.status === AuthenticationStatus.AUTHENTICATED) {
            this.doRedirect(this.props.nextRequest);
            return true;
        }
        // TODO: restore this; it appears to handle the case of sitting on the signin
        // page and then receiving a loggedin message, triggering a redirect to the next
        // request.
        // this.listeners.push(
        //     this.props.runtime.recv('session', 'loggedin', () => {
        //         this.doRedirect(nextRequest);
        //     })
        // );
        return false;
    }

    /**
     * Create a "redirect url" to be provided to the auth service.
     * 
     * This url is not actually used as the target of redirection -  rather it must
     * match the redirect url base URL registered for the auth environment (determined
     * by the auth service hostname we call). The state param is extracted from the
     * redirect url and placed onto the configured redirect url actually used.
     */
    makeRedirectURL() {
        const params: Record<string, string> = {
            state: JSON.stringify({
                nextrequest: this.props.nextRequest,
                origin
            })
        };

        // const search = Object.keys(query)
        //     .map((key) => {
        //         return [key, encodeURIComponent(query[key])].join('=');
        //     })
        //     .join('&');

        // The logical app origin is now provided by configuration, as the
        // plugin/kbase-ui is probably running on a sub-domain host.

        // const appOrigin = this.props.origin;
        
        // return `${appOrigin}?${search}`;

        return navigationPathToURL({path: '', type: 'europaui', params }, false).toString();
    };

    async doSignIn(provider: IDProvider) {
        const auth2Client = new Auth2({
            baseUrl: this.props.authURL
        });

        try {
            await auth2Client.loginCancel();
        } catch (ex) {
            if (ex instanceof AuthError) {
                // ignore this specific error...
                if (ex.code !== '10010') {
                    // TODO: set error state
                    throw ex;
                }
            } else {
                // TODO: show error.
                console.error('Skipping error', ex);
            }
        }

        this.setState({
            signInState: {
                mode: 'signin',
                status: 'go',
                provider
            }
        });
    }


    async doSignUp(provider: IDProvider) {
        const auth2Client = new Auth2({
            baseUrl: this.props.authURL
        });

        try {
            await auth2Client.loginCancel();
        } catch (ex) {
            if (ex instanceof AuthError) {
                // ignore this specific error...
                if (ex.code !== '10010') {
                    // TODO: set error state
                    throw ex;
                }
            } else {
                // TODO: show error.
                console.error('Skipping error', ex);
            }
        }

        this.setState({
            signInState: {
                mode: 'signup',
                status: 'go',
                provider
            }
        })
    }

    // /**
    //  * 
    //  * Primarily just redirects to the signup page.
    //  * 
    //  *
    //  */
    // async doSignUp() {
    //     const auth2Client = new Auth2({
    //         baseUrl: this.props.authURL
    //     });

    //     try {
    //         await auth2Client.loginCancel();
    //     } catch (ex) {
    //         if (ex instanceof AuthError) {
    //             // ignore this specific error...
    //             if (ex.code !== '10010') {
    //                 throw ex;
    //             }
    //         } else {
    //             // TODO: show error.
    //             console.error('Skipping error', ex);
    //         }
    //     }
    //     //  don't care whether it succeeded or failed.
    //     // const params: Record<string, string> = {
    //     //     provider: provider.id,
    //     //     redirecturl: this.makeRedirectURL()
    //     //     // not used
    //     //     // stayloggedin: false
    //     // };

    //     navigate('signup');
    // }

    chooseSignIn() {
        this.setState ({
            signInState: {
                ...this.state.signInState,
                mode: 'signin'
            }
        })
    }

    chooseSignUp() {
        this.setState ({
            signInState: {
                ...this.state.signInState,
                mode: 'signup'
            }
        })
    }

    doGo(provider: IDProvider) {
        this.setState({
            signInState: {
                ...this.state.signInState,
                status: 'go',
                provider
            }
        })
    }

    renderSigninChoosing() {
        const source = this.props.source;
        return <div className="SignIn">
            <div style={{marginBottom: '20px'}}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img src={kbaseLogo}
                            style={{height: '50px'}} />
                    <h2 style={{
                        fontWeight: 'bold',
                        margin: '0',
                        padding: '0',
                        marginLeft: '10px',
                        color: 'rgba(50, 50, 50, 1)'
                    }}>
                        Welcome to KBase
                    </h2>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <p style={{
                        maxWidth: '25em',
                        fontStyle: 'italic',
                        fontWeight: 'bold',
                        color: 'rgba(100, 100, 100, 1)',
                        marginTop: '10px',
                        textAlign: 'center'
                    }}>
                        A collaborative, open environment for systems biology of plants, microbes and their communities
                    </p>
                </div>
            </div>
            <SignInControls 
                providers={this.props.providers}
                // source={source} 
                // assetsPath={this.props.runtime.pluginResourcePath}
                mode={this.state.signInState.mode}
                nextRequest={this.props.nextRequest} 
                authRequired={source === 'authorization'}
                chooseSignIn={this.chooseSignIn.bind(this)}
                chooseSignUp={this.chooseSignUp.bind(this)}
                go={this.doGo.bind(this)}
            />
        </div>
    }

    renderSignInSignIn(provider: IDProvider) {
        const redirectURL = this.makeRedirectURL();
        
        const params: Record<string, string> = {
            provider: provider.id,
            redirecturl: redirectURL
        };

        const action = `${this.props.authURL}/login/start`;

        return <AutoPostForm action={action} params={params} />
    }

    renderSignInSignUp(provider: IDProvider) {
        const redirectURL = this.makeRedirectURL();

        const params: Record<string, string> = {
            provider: provider.id,
            redirecturl: redirectURL,
        };

        const action = `${this.props.authURL}/login/start`;

        return <AutoPostForm action={action} params={params} />
    }


    render() {
       const {mode, status} = this.state.signInState;
       switch (status) {
            case 'choosing': return this.renderSigninChoosing();
            case 'go': 
                switch (mode) {
                    case 'signin': return this.renderSignInSignIn(this.state.signInState.provider);
                    case 'signup': return this.renderSignInSignUp(this.state.signInState.provider);
                }
       }
    }
}
