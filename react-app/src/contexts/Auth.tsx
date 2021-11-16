import UserProfileClient, {
    UserProfile,
} from '@kbase/ui-lib/lib/comm/coreServices/UserProfile';
import React from 'react';
import {
    AsyncProcess,
    AsyncProcessError,
    AsyncProcessStatus,
    AsyncProcessSuccess,
} from '../lib/AsyncProcess';

import { BrowserAuth } from '../lib/BrowserAuth';
import { Account, TokenInfo, Auth2 } from '../lib/kb_lib/Auth2';

import { JSONRPC11Exception } from '../lib/kb_lib/comm/JSONRPC11/JSONRPC11';
import * as Cookie from 'es-cookie';
import { Config } from '../types/config';

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
}

export interface AuthenticationStateUnauthenticated
    extends AuthenticationStatusBase {
    status: AuthenticationStatus.UNAUTHENTICATED;
    login: (token: string) => Promise<void>;
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

export const AuthContext = React.createContext<AuthState>({
    status: AsyncProcessStatus.NONE,
});

// Auth Wrapper Component

export interface AuthWrapperProps {
    config: Config;
}

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
export default class AuthWrapper extends React.Component<
    AuthWrapperProps,
    AuthWrapperState
> {
    constructor(props: AuthWrapperProps) {
        super(props);
        this.state = {
            authState: {
                status: AsyncProcessStatus.NONE,
            },
        };
    }

    componentDidMount() {
        this.fetchTokenInfo();
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

    async fetchTokenInfo() {
        const token = BrowserAuth.getToken();

        if (token === null) {
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
            } else if (ex instanceof Error) {
                this.setState({ authState: this.errorState(ex.message) });
            } else {
                this.setState({ authState: this.errorState('Unknown') });
            }
        }
    }

    async logout() {
        // Remove cookie
        const token = BrowserAuth.getToken();

        // Logout from auth
        if (token === null) {
            return;
        }

        BrowserAuth.removeToken();

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
            } else if (ex instanceof Error) {
                this.setState({ authState: this.errorState(ex.message) });
            } else {
                this.setState({ authState: this.errorState('Unknown') });
            }
        }
        const noToken = await BrowserAuth.getToken();
        if (noToken === null) {
            this.setState({ authState: this.unauthenticatedState() });
        } else {
            this.setState({ authState: this.errorState('Could not log out') });
        }
    }

    async login(token: string) {
        Cookie.set(this.props.config.services.Auth2.cookieName, token, {
            path: '/',
            sameSite: 'strict',
        });
        await this.fetchTokenInfo();
    }

    render() {
        return (
            <AuthContext.Provider value={this.state.authState}>
                {this.props.children}
            </AuthContext.Provider>
        );
    }
}
