import { SimpleError } from 'lib/SimpleError';
import UserProfileClient, {
    UserProfile,
} from 'lib/kb_lib/comm/coreServices/UserProfile';
import { Messenger } from 'lib/messenger';
import { navigate2 } from 'lib/navigation';
import { Component, PropsWithChildren, createContext } from 'react';
import { Config } from 'types/config';
import { v4 as uuidv4 } from 'uuid';
import { AsyncProcess, AsyncProcessStatus } from '../lib/AsyncProcess';
import { Account, Auth2, TokenInfo } from '../lib/kb_lib/Auth2';
import EuropaConnection, {
    AuthNavigatePayload,
    DeauthenticatedPayload,
    EuropaAuthenticatedPayload,
} from './EuropaConnection';

export const $GlobalMessenger = new Messenger();

export function notifySuccess(message: string, autodismiss: number = 3000) {
    $GlobalMessenger.send('notification', 'notify', {
        title: 'Success',
        message,
        autodismiss,
        variant: 'success',
    });
}

export function notifyError(message: string, autodismiss: number = 3000) {
    $GlobalMessenger.send('notification', 'notify', {
        title: 'Error',
        message,
        autodismiss,
        variant: 'danger',
    });
}

export interface NavigationMessagePayload {
    path: string;
    params?: Record<string, string>;
    type?: 'kbaseui' | 'europaui';
}

export interface RedirectMessagePayload {
    url: string;
    newWindow?: boolean;
}

export interface Envelope {
    channel: string;
}

// export type MessagePayload = unknown;

export interface MessageData {
    name: string;
    envelope: Envelope;
    payload: unknown;
}

export interface NotifyOptions {
    title: string;
    message: string;
    variant: string;
    autodismiss?: number;
}

export interface MessagePayload<T> {
    envelope: {
        from: string;
        to: string;
    };
    payload: T;
}

export function notify({
    title,
    message,
    variant,
    autodismiss,
}: NotifyOptions) {
    if (typeof autodismiss === 'undefined') {
        autodismiss = 3000;
    }
    $GlobalMessenger.send('notification', 'notify', {
        title,
        message,
        variant,
        autodismiss,
    });
}

export interface AuthInfo {
    token: string;
    tokenInfo: TokenInfo;
    account: Account;
}

// Message interfaces.

// Message sent from Europa to kbase-ui
export interface StartPayload {
    authToken: string | null;
    initialPath: string;
    initialParams: Record<string, string>;
    channelId: string;
}

export interface EuropaNavigationPayload {
    path: string;
    params: Record<string, string>;
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
}

export interface AuthenticationStateUnauthenticated
    extends AuthenticationStatusBase {
    status: AuthenticationStatus.UNAUTHENTICATED;
}

export type AuthenticationState =
    | AuthenticationStateNone
    | AuthenticationStateAuthenticated
    | AuthenticationStateUnauthenticated;

/**
 * Holds the current config information
 */
export interface EuropaInfo {
    authState: AuthenticationState;
    //   europaOrigin: string;
    messenger: Messenger;
    config: Config;
    isHosted: boolean;
    channelId: string;
    notify: (options: NotifyOptions) => void;
    setTitle: (title: string) => void;
}

export type EuropaState = AsyncProcess<EuropaInfo, SimpleError>;

// Context

/**
 * The AuthContext is the basis for propagating auth state
 * throughout the app.
 */

export const EuropaContext = createContext<EuropaState>({
    status: AsyncProcessStatus.NONE,
});

// Europa Wrapper Component

export type EuropaWrapperProps = PropsWithChildren<{
    config: Config;
}>;

export interface EuropaWrapperState {
    europaState: EuropaState;
    id: string;
    originalURL: URL;
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
export default class EuropaWrapper extends Component<
    EuropaWrapperProps,
    EuropaWrapperState
> {
    connection: EuropaConnection;
    instance: string;
    constructor(props: EuropaWrapperProps) {
        super(props);

        this.state = {
            europaState: {
                status: AsyncProcessStatus.NONE,
            },
            id: uuidv4(),
            originalURL: new URL(window.location.href),
        };

        this.instance = uuidv4();

        this.connection = new EuropaConnection({
            config: this.props.config,
            messenger: $GlobalMessenger,
            onDeauthenticated: this.onDeauthenticated.bind(this),
            onAuthenticated: this.onAuthenticated.bind(this),
            onAuthNavigate: this.onAuthNavigate.bind(this),
            spyOnMessages: false,
        });
    }

    async componentDidMount() {
        this.setState({
            europaState: {
                status: AsyncProcessStatus.PENDING,
            },
        });

        // Detect if not running in iframe.
        if (window === window.parent) {
            this.setState({
                europaState: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message: 'kbase-ui only operates within an iframe',
                    },
                },
            });
            return;
        }

        // Fix up the url (it will have the channel id param)
        const url = new URL(this.state.originalURL);
        const receiveChannelId = url.searchParams.get('receiveChannelId');
        const sendChannelId = url.searchParams.get('sendChannelId');
        if (!sendChannelId || !receiveChannelId) {
            this.setState({
                europaState: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message: 'Channel ids not provided in initial url',
                    },
                },
            });
            return;
        }

        // remove channelId and replace the url.

        // Continue connecting to Europa.
        try {
            await this.connection.connect({ sendChannelId, receiveChannelId });
        } catch (ex) {
            this.setState({
                europaState: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message:
                            ex instanceof Error ? ex.message : 'Unknown Error',
                    },
                },
            });
        }
    }

    setTitle(title: string) {
        this.connection.setTitle(title);
    }

    // Dismounting behavior is really only invoked during development; as
    componentWillUnmount() {
        this.connection.disconnect();
        window.history.replaceState(
            null,
            '',
            this.state.originalURL.toString(),
        );
    }

    onDeauthenticated({ navigation }: DeauthenticatedPayload) {
        if (this.state.europaState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        // if (this.state.europaState.value.authState.status !== AuthenticationStatus.AUTHENTICATED) {
        //   return;
        // }
        this.setState(
            {
                europaState: {
                    ...this.state.europaState,
                    value: {
                        ...this.state.europaState.value,
                        authState: {
                            status: AuthenticationStatus.UNAUTHENTICATED,
                        },
                    },
                },
            },
            () => {
                // Europa may send a "next request", or a follow-up url, to display.
                // Typically this is auth2/loggedout. If omitted, the current kbase-ui view
                // will continue being displayed, and may alter itself in response to the
                // change in authentication state.
                if (navigation) {
                    navigate2({ ...navigation, type: 'kbaseui' });
                } else {
                    navigate2({ path: 'auth2/signedout', type: 'kbaseui' });
                }
            },
        );
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

    async onAuthenticated({ token, navigation }: EuropaAuthenticatedPayload) {
        if (this.state.europaState.status !== AsyncProcessStatus.SUCCESS) {
            return false;
        }

        const auth = new Auth2({
            baseUrl: this.props.config.services.Auth2.url,
        });

        try {
            const [tokenInfo, account] = await Promise.all([
                auth.getTokenInfo(token),
                auth.getMe(token),
            ]);
            if (tokenInfo === null) {
                this.setState({
                    europaState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: `Authenticating with invalid token.`,
                        },
                    },
                });
                return;
            }

            const userProfile = await this.fetchUserProfile(
                token,
                tokenInfo.user,
            );

            this.setState(
                {
                    europaState: {
                        ...this.state.europaState,
                        value: {
                            ...this.state.europaState.value,
                            authState: {
                                status: AuthenticationStatus.AUTHENTICATED,
                                authInfo: {
                                    token,
                                    tokenInfo,
                                    account,
                                },
                                userProfile,
                            },
                        },
                    },
                },
                () => {
                    if (navigation) {
                        navigate2({
                            path: navigation.path,
                            params: navigation.params,
                            type: 'kbaseui',
                        });
                    }
                },
            );
        } catch (ex) {
            // We have code to consider this an exception - to receive a token from Europa
            // which is invalid (should be by far the most common reason for an error).
            // Now, how can this happen, as Europa will validate the token before setting it
            // (which in turn triggers europa.authenticated to be sent?)
            // This occurs commonly during development, but should not occur in productino.
            //
            // The reason is the usage of "StrictMode" which duplicates all renders
            // and effects. This causes trouble as  Europa depends to some degree upon
            // noticing changes in state to trigger asynchronous effects (e.g. during
            // sign in and sign out).
            // For example, during sign
            //   const message = ex instanceof Error ? ex.message : 'Unknown error';
            //   console.warn(`europa.authenticate message contained invalid token: ${message}`);
            //   return {
            //     status: AuthenticationStatus.UNAUTHENTICATED,
            //   };

            throw new Error(
                `Error setting auth: ${ex instanceof Error ? ex.message : 'Unknown error'}`,
            );
        }
    }

    async onAuthNavigate({
        token,
        navigation: { path, params },
    }: AuthNavigatePayload) {
        if (this.state.europaState.status !== AsyncProcessStatus.PENDING) {
            return false;
        }

        try {
            if (token) {
                const auth = new Auth2({
                    baseUrl: this.props.config.services.Auth2.url,
                });
                const [tokenInfo, account] = await Promise.all([
                    auth.getTokenInfo(token),
                    auth.getMe(token),
                ]);
                if (tokenInfo === null) {
                    this.setState({
                        europaState: {
                            status: AsyncProcessStatus.ERROR,
                            error: {
                                message: `Authenticating with invalid token.`,
                            },
                        },
                    });
                    return;
                }

                const userProfile = await this.fetchUserProfile(
                    token,
                    tokenInfo.user,
                );

                this.setState(
                    {
                        europaState: {
                            status: AsyncProcessStatus.SUCCESS,
                            value: {
                                authState: {
                                    status: AuthenticationStatus.AUTHENTICATED,
                                    authInfo: {
                                        token,
                                        tokenInfo,
                                        account,
                                    },
                                    userProfile,
                                },
                                channelId: 'europa_kbaseui_channel',
                                config: this.props.config,
                                isHosted: window.parent !== window,
                                messenger: $GlobalMessenger,
                                notify,
                                setTitle: this.setTitle.bind(this),
                            },
                        },
                    },
                    () => {
                        navigate2({ path, params, type: 'kbaseui' });
                    },
                );
            } else {
                this.setState(
                    {
                        europaState: {
                            status: AsyncProcessStatus.SUCCESS,
                            value: {
                                authState: {
                                    status: AuthenticationStatus.UNAUTHENTICATED,
                                },
                                channelId: 'europa_kbaseui_channel',
                                config: this.props.config,
                                isHosted: window.parent !== window,
                                messenger: $GlobalMessenger,
                                notify,
                                setTitle: this.setTitle.bind(this),
                            },
                        },
                    },
                    () => {
                        navigate2({ path, params, type: 'kbaseui' });
                    },
                );
            }
        } catch (ex) {
            // We have code to consider this an exception - to receive a token from Europa
            // which is invalid (should be by far the most common reason for an error).
            // Now, how can this happen, as Europa will validate the token before setting it
            // (which in turn triggers europa.authenticated to be sent?)
            // This occurs commonly during development, but should not occur in productino.
            //
            // The reason is the usage of "StrictMode" which duplicates all renders
            // and effects. This causes trouble as  Europa depends to some degree upon
            // noticing changes in state to trigger asynchronous effects (e.g. during
            // sign in and sign out).
            // For example, during sign
            //   const message = ex instanceof Error ? ex.message : 'Unknown error';
            //   console.warn(`europa.authenticate message contained invalid token: ${message}`);
            //   return {
            //     status: AuthenticationStatus.UNAUTHENTICATED,
            //   };

            throw new Error(
                `Error setting auth: ${ex instanceof Error ? ex.message : 'Unknown error'}`,
            );
        }
    }

    render() {
        return (
            <EuropaContext.Provider value={this.state.europaState}>
                {this.props.children}
            </EuropaContext.Provider>
        );
    }
}
