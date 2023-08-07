import UserProfileClient, {
    UserProfile
} from '@kbase/ui-lib/lib/comm/coreServices/UserProfile';
import { Component, PropsWithChildren, createContext } from 'react';
import {
    AsyncProcess,
    AsyncProcessError,
    AsyncProcessStatus,
    AsyncProcessSuccess
} from '../lib/AsyncProcess';

import { Account, Auth2, TokenInfo } from '../lib/kb_lib/Auth2';

import * as Cookie from 'es-cookie';
import { changeHash2 } from 'lib/navigation';
import { Monitor } from '../lib/Monitor';
import { AuthError } from '../lib/kb_lib/Auth2Error';
import { JSONRPC11Exception } from '../lib/kb_lib/comm/JSONRPC11/JSONRPC11';
import { Config, CookieConfig } from '../types/config';
import { HashPath } from './RouterContext';

/**
 * Holds the current authentication information
 */
export interface AuthInfo {
    token: string;
    tokenInfo: TokenInfo;
    account: Account;
}

/**
 * Auth state -
 *
 * Follows the state machine model, in which we have a status enum, which is
 * used as the status field for a "state" interface. This allows us to implement
 * run-time type narrowing, based on the value of the "status" enum, aka
 * discriminated union.
 *
 * NONE - auth state unknown
 * AUTHENTICATED - token found in browser, determined to be valid
 * UNAUTHENTICATED - no token found in browser, or token is invalid.
 */
export enum AuthenticationStatus {
    NONE = 'NONE',
    AUTHENTICATED = 'AUTHENTICATED',
    UNAUTHENTICATED = 'UNAUTHENTICATED',
}

export interface AuthenticationStatusBase {
    status: AuthenticationStatus;
}

export interface AuthenticationStateNone extends AuthenticationStatusBase {
    status: AuthenticationStatus.NONE;
}

export interface AuthenticationStateAuthenticated
    extends AuthenticationStatusBase {
    status: AuthenticationStatus.AUTHENTICATED;
    authInfo: AuthInfo;
    userProfile: UserProfile;
    logout: () => Promise<void>;
    sync: () => Promise<void>;
}

export interface AuthenticationStateUnauthenticated
    extends AuthenticationStatusBase {
    status: AuthenticationStatus.UNAUTHENTICATED;
    login: (token: string, expires: number) => Promise<void>;
}

export type AuthenticationState =
    | AuthenticationStateNone
    | AuthenticationStateAuthenticated
    | AuthenticationStateUnauthenticated;

export type AuthState = AsyncProcess<AuthenticationState, string>;

// Context

/**
 * The AuthContext is the basis for propagating auth state
 * throughout the app.
 */

export const AuthContext = createContext<AuthState>({
    status: AsyncProcessStatus.NONE,
});

// Auth Wrapper Component

export type AuthWrapperProps = PropsWithChildren<{
    config: Config;
}>;

interface AuthWrapperState {
    authState: AuthState;
}

/**
 * Wraps a component tree, ensuring that authentication status is
 * resolved and placed into the AuthContext. The auth state in the
 * context can then be used by descendants to do "the right thing".
 * In this app, the right thing is to show an error message if
 * there is lack of authentication (no token, invalid token), and to
 * proceed otherwise.
 *
 * Also note that the auth state is itself wrapped into an AsyncProcess,
 * which ensures that descendants can handle the async behavior of
 * determining the auth state (because we may need to call the auth service),
 * which includes any errors encountered.
 */
export default class AuthWrapper extends Component<
    AuthWrapperProps,
    AuthWrapperState
> {
    tokenChangeMonitor: Monitor;
    tokenValidationMonitor: Monitor;
    config: CookieConfig;
    constructor(props: AuthWrapperProps) {
        super(props);
        this.config = this.props.config.ui.services.session.cookie;
        this.state = {
            authState: {
                status: AsyncProcessStatus.NONE,
            },
        };

        this.tokenChangeMonitor = new Monitor({
            callback: () => {
                return this.checkTokenChange();
            },
            interval: this.props.config.ui.services.session.cookieChangeDetectionInterval
        });
        this.tokenValidationMonitor = new Monitor({
            callback: () => {
                return this.checkTokenValidity();
            },
            interval: this.props.config.ui.services.session.tokenValidationInterval
        });
    }

    componentDidMount() {
        this.syncTokenInfo();
        this.tokenChangeMonitor.start();
        this.tokenValidationMonitor.start();
    }

    componentWillUnmount() {
        this.tokenValidationMonitor.stop();
        this.tokenChangeMonitor.stop();
    }

    async checkTokenChange() {
        /*
        cases to handle:
        - have token, token changes: ignore new token, simply logout
        - have token, no token: logout
        - no token, have token: fetch token info
        */
        const state = this.state;
        switch (state.authState.status) {
            case AsyncProcessStatus.NONE:
                // ignore
                break;
            case AsyncProcessStatus.PENDING:
                // ignore
                break;
            case AsyncProcessStatus.SUCCESS: {
                switch (state.authState.value.status) {
                    case AuthenticationStatus.NONE:
                    case AuthenticationStatus.UNAUTHENTICATED:
                        return this.checkAuth();
                    case AuthenticationStatus.AUTHENTICATED: {
                        const token = this.getAuthCookie();
                        if (typeof token === 'undefined') {
                            // Handles case in which the ui had been logged in, but now there is no token!
                            this.setState({ authState: this.unauthenticatedState() }, () => {
                                changeHash2('auth2/signedout');
                            });
                        } else if (token !== state.authState.value.authInfo.token) {
                            // Handles case in which the browser is logged out and logged in 
                            // before the above case can be handled. Not impossible, but not
                            // probable for a human operator.
                            await this.logout();
                            changeHash2('auth2/signedout');
                        }
                    }
                }
                break;
            }
            case AsyncProcessStatus.ERROR:
                this.syncTokenInfo();
                break;
        }
    }

    /**
     * Validate the current token, if any.
     * 
     * Note that this only handles the case of an authenticated session, ensuring that the
     * current cookie is valid by checking with the auth server.
     * 
     * See the token change monitor for other cases.
     */
    async checkTokenValidity() {
        const state = this.state;
        switch (state.authState.status) {
            case AsyncProcessStatus.NONE:
                // ignore
                break;
            case AsyncProcessStatus.PENDING:
                // ignore
                break;
            case AsyncProcessStatus.SUCCESS: {
                switch (state.authState.value.status) {
                    case AuthenticationStatus.NONE:
                    case AuthenticationStatus.UNAUTHENTICATED:
                        return this.checkAuth();
                    case AuthenticationStatus.AUTHENTICATED: {
                        return this.ensureValidToken();
                    }
                }
                break;
            }
            case AsyncProcessStatus.ERROR:
                this.syncTokenInfo();
                break;
        }
    }

    async fetchUserProfile(token: string, username: string) {
        const userModel = new UserProfileClient({
            url: this.props.config.services.UserProfile.url,
            timeout: this.props.config.ui.constants.clientTimeout,
            token,
        });
        const [userProfile] = await userModel.get_user_profile([username]);
        if (userProfile === null) {
            throw new Error(`User not found: ${username}`);
        }
        return userProfile;
    }

    unauthenticatedState(): AsyncProcessSuccess<AuthenticationStateUnauthenticated> {
        return {
            status: AsyncProcessStatus.SUCCESS,
            value: {
                status: AuthenticationStatus.UNAUTHENTICATED,
                login: this.login.bind(this),
            },
        };
    }

    errorState(error: string): AsyncProcessError<string> {
        return {
            status: AsyncProcessStatus.ERROR,
            error,
        };
    }

    async ensureValidToken() {
        const token = this.getAuthCookie();
        if (typeof token === 'undefined') {
            this.setState({ authState: this.unauthenticatedState() });
            return;
        }

        const removeToken = () => {
            this.removeAuthCookie();
            this.setState({
                authState: this.unauthenticatedState(),
            }, () => {
                changeHash2('auth2/signedout');
            });
        }

        const auth = new Auth2({
            baseUrl: this.props.config.services.Auth2.url,
        });
        // TODO: need a call like auth.validateToken(token);
        try {
            const tokenInfo = await auth.getTokenInfo(token);
            if (tokenInfo === null) {
                removeToken();
            }
        } catch (ex) {
            if (ex instanceof AuthError) {
                if (ex.code === '10020') {
                    console.warn('token invalid');
                    removeToken();
                }
            } else if (ex instanceof Error) {
                // what to do?
                console.error('ERROR', ex);
            } else {
                console.error('UNKNOWN ERROR', ex);
            }
        }
    }

    async syncTokenInfo() {
        const token = this.getAuthCookie();

        if (typeof token === 'undefined') {
            this.setState({ authState: this.unauthenticatedState() });
            return;
        }

        const auth = new Auth2({
            baseUrl: this.props.config.services.Auth2.url,
        });

        try {
            const tokenInfo = await auth.getTokenInfo(token);
            const account = await auth.getMe(token);
            if (tokenInfo === null) {
                this.setState({ authState: this.unauthenticatedState() });
            } else {
                const userProfile = await this.fetchUserProfile(
                    token,
                    tokenInfo.user
                );
                this.setState({
                    authState: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: {
                            status: AuthenticationStatus.AUTHENTICATED,
                            authInfo: {
                                token,
                                tokenInfo,
                                account,
                            },
                            userProfile,
                            logout: this.logout.bind(this),
                            sync: this.syncTokenInfo.bind(this)
                        },
                    },
                });
            }
        } catch (ex) {
            if (ex instanceof JSONRPC11Exception) {
                switch (ex.error.code) {
                    case 10020:
                        this.setState({
                            authState: this.unauthenticatedState(),
                        });
                        break;
                    default:
                        this.setState({
                            authState: this.errorState(ex.error.message),
                        });
                }
            } else if (ex instanceof AuthError) {
                // BrowserAuth.removeToken();
                switch (ex.code) {
                    case '10020':
                        this.removeAuthCookie();
                        this.setState({
                            authState: this.unauthenticatedState(),
                        });
                        break;
                    default:
                        this.removeAuthCookie();
                        this.setState({
                            authState: this.unauthenticatedState(),
                        });
                }
                // this.setState({ authState: this.errorState(ex.message) });
            } else if (ex instanceof Error) {
                this.setState({
                    authState: this.unauthenticatedState(),
                });
                // this.setState({ authState: this.errorState(ex.message) });
            } else {
                this.setState({
                    authState: this.unauthenticatedState(),
                });
                // this.setState({ authState: this.errorState('Unknown') });
            }
        }
    }

    async asyncSetState(newState: AuthWrapperState): Promise<void> {
        return new Promise((resolve) => {
            this.setState(newState, () => {
                resolve();
            });
        });
    }

    fromURL(): HashPath | null {
        // ?source=authorization&nextrequest=%7B%22realPath%22%3A%22%2F%22%2C%22path%22%3A%5B%22feeds%22%5D%2C%22original%22%3A%22feeds%22%2C%22query%22%3A%7B%7D%7D#login
        const url = new URL(window.location.href);
        const nextRequest = url.searchParams.get('nextrequest');
        if (!nextRequest) {
            return null;
        }

        try {
            const {
                realPath, path, original, query
            } = JSON.parse(nextRequest);

            if (typeof realPath === 'string' &&
                (path instanceof Array && path.every((element) => {
                    return typeof element === 'string'
                })) &&
                typeof original === 'string' &&
                (query instanceof {}.constructor && Object.entries(query).every(([key, value]) => {
                    return typeof key === 'string' && typeof value === 'string'
                }))) {

                // TODO: the query should be a plain object; see Router2
                const searchParams: URLSearchParams = new URL('https://example.com').searchParams;
                for (const [key, value] of Object.entries(query)) {
                    searchParams.set(key, value);
                }
                return {
                    realPath, path, query: searchParams, hash: path.join('/')
                }
            }
            console.warn('It looks like an invalid nextrequest: ', nextRequest, JSON.parse(nextRequest));
            return null;
        } catch (ex) {
            console.error('Invalid nextRequest will not parse', nextRequest, ex);
            return null;
        }
    }

    async checkAuth() {
        const token = this.getAuthCookie();

        if (typeof token === 'undefined') {
            // This is the stable state -- was unauthenticated, still is!
            return;
        }

        const auth = new Auth2({
            baseUrl: this.props.config.services.Auth2.url,
        });

        try {
            const tokenInfo = await auth.getTokenInfo(token);
            const account = await auth.getMe(token);
            if (tokenInfo === null) {
                await this.asyncSetState({ authState: this.unauthenticatedState() });
                // TODO: should be configurable
                changeHash2('auth2/signedout');
            } else {
                const userProfile = await this.fetchUserProfile(
                    token,
                    tokenInfo.user
                );
                await this.asyncSetState({
                    authState: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: {
                            status: AuthenticationStatus.AUTHENTICATED,
                            authInfo: {
                                token,
                                tokenInfo,
                                account,
                            },
                            userProfile,
                            logout: this.logout.bind(this),
                            sync: this.syncTokenInfo.bind(this)
                        },
                    },
                });
                // TODO: should be configured default view.

                // If we are sitting on the login view, with a nextrequest, we should honor it.
                const url = new URL(window.location.href);
                if (url.hash === '#login') {
                    const nextRequest = this.fromURL();
                    if (nextRequest) {
                        changeHash2(nextRequest.hash);
                        return;
                    }
                }
                changeHash2('dashboard');
            }
        } catch (ex) {
            if (ex instanceof JSONRPC11Exception) {
                switch (ex.error.code) {
                    case 10020:
                        await this.asyncSetState({
                            authState: this.unauthenticatedState(),
                        });
                        changeHash2('auth2/signedout');
                        break;
                    default:
                        // what happens here?
                        this.setState({
                            authState: this.errorState(ex.error.message),
                        });
                }
            } else if (ex instanceof AuthError) {
                // BrowserAuth.removeToken();
                switch (ex.code) {
                    case '10020':
                        this.removeAuthCookie();
                        await this.asyncSetState({
                            authState: this.unauthenticatedState(),
                        });
                        changeHash2('auth2/signedout',);
                        break;
                    default:
                        this.removeAuthCookie();
                        await this.asyncSetState({
                            authState: this.unauthenticatedState(),
                        });
                        changeHash2('auth2/signedout');
                }
                // this.setState({ authState: this.errorState(ex.message) });
            } else if (ex instanceof Error) {
                await this.asyncSetState({
                    authState: this.unauthenticatedState(),
                });
                changeHash2('auth2/signedout');
                // this.setState({ authState: this.errorState(ex.message) });
            } else {
                await this.asyncSetState({
                    authState: this.unauthenticatedState(),
                });
                changeHash2('auth2/signedout');
                // this.setState({ authState: this.errorState('Unknown') });
            }
        }
    }

    getAuthCookie(): string | undefined {
        return Cookie.get(this.config.name);
    }

    removeAuthCookie() {
        const cookieAttributes: Cookie.CookieAttributes = {
            path: '/'
        };
        Cookie.remove(this.config.name, cookieAttributes);
    }

    async logout() {
        // Remove cookie
        const token = this.getAuthCookie();

        // Logout from auth
        if (typeof token === 'undefined') {
            return;
        }

        this.removeAuthCookie();

        const auth = new Auth2({
            baseUrl: this.props.config.services.Auth2.url,
        });

        try {
            await auth.logout(token);
        } catch (ex) {
            if (ex instanceof JSONRPC11Exception) {
                switch (ex.error.code) {
                    // TODO: check real error codes
                    case 10020:
                        this.setState({
                            authState: this.unauthenticatedState(),
                        });
                        break;
                    default:
                        this.setState({
                            authState: this.errorState(ex.error.message),
                        });
                }
            } else if (ex instanceof AuthError) {
                // BrowserAuth.removeToken();
                console.error('AUTH error', ex);
                this.setState({ authState: this.errorState(ex.message) });
            } else if (ex instanceof Error) {
                this.setState({ authState: this.errorState(ex.message) });
            } else {
                this.setState({ authState: this.errorState('Unknown') });
            }
        }
        const noToken = this.getAuthCookie();
        if (typeof noToken === 'undefined') {
            this.setState({ authState: this.unauthenticatedState() });
        } else {
            this.setState({ authState: this.errorState('Could not log out') });
        }
    }

    async login(token: string, expires: number) {
        // Set the primary auth cookie.
        const cookieAttributes: Cookie.CookieAttributes = {
            path: '/',
            sameSite: 'lax'
        };
        if (expires) {
            cookieAttributes.expires = new Date(expires);
        }
        Cookie.set(this.config.name, token, cookieAttributes);

        // Then set the backup cookie.
        // This cookie is only used by services in prod, since prod services
        // operate on a different host than the ui.
        if (this.config.backup.enabled) {
            const cookieAttributes: Cookie.CookieAttributes = {
                path: '/',
                sameSite: 'lax'
            };
            if (expires) {
                cookieAttributes.expires = new Date(expires);
            }
            if (this.config.backup.domain) {
                cookieAttributes.domain = this.config.backup.domain;
            }
            Cookie.set(this.config.backup.name, token, cookieAttributes);
        }

        await this.syncTokenInfo();
    }

    render() {
        return (
            <AuthContext.Provider value={this.state.authState}>
                {this.props.children}
            </AuthContext.Provider>
        );
    }
}
