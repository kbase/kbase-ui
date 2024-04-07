import AJV from 'ajv';
import { SomeJSONSchema } from 'ajv/dist/types/json-schema';
import { NextRequestObject } from 'lib/NextRequest';
import ReceiveChannel from 'lib/ReceiveChannel';
import SendChannel, { ChannelMessage } from 'lib/SendChannel';
import { AuthError } from 'lib/kb_lib/Auth2Error';
import { JSONRPC11Exception } from 'lib/kb_lib/comm/JSONRPC11/JSONRPC11';
import UserProfileClient, {
    UserProfile,
} from 'lib/kb_lib/comm/coreServices/UserProfile';
import { Messenger } from 'lib/messenger';
import { ResourcePath, navigate2 } from 'lib/navigation';
import { Config } from 'types/config';
import { v4 as uuidv4 } from 'uuid';
import { Account, Auth2, TokenInfo } from '../lib/kb_lib/Auth2';
import { RedirectMessagePayload } from './EuropaContext';
import { urlToNavigationPath } from './RouterContext';

// Message payloads

export interface KBaseUINavigatedMessagePayload {
    path: string;
    params?: Record<string, string>;
    type?: 'kbaseui' | 'europaui';
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

export interface AuthInfo {
    token: string;
    tokenInfo: TokenInfo;
    account: Account;
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

// Message interfaces.

// Message sent from Europa to kbase-ui
export interface StartPayload {
    authToken: string | null;
    initialPath: string;
    initialParams: Record<string, string>;
    channelId: string;
}

export interface AuthNavigatePayload {
    token: string | null;
    navigation: ResourcePath;
}

export interface EuropaConnectPayload {
    channelId: string;
}
const KBASE_UI_CONNECT_PAYLOAD_SCHEMA: SomeJSONSchema = {
    type: 'object',
    required: ['channel'],
    additionalProperties: false,
    properties: {
        channel: { type: 'string' },
    },
};
export function assertKBaseUIConnectPayload(
    payload: unknown,
): asserts payload is EuropaConnectPayload {
    const validate = new AJV().compile(KBASE_UI_CONNECT_PAYLOAD_SCHEMA);
    const isValid = validate(payload);
    if (!isValid) {
        throw new Error('connect payload is not valid');
    }
}

export interface EuropaAuthenticatedPayload {
    token: string;
    navigation?: ResourcePath;
}

export interface EuropaNavigationPayload {
    path: string;
    params: Record<string, string>;
}

export interface EuropaConnectPayload {
    token?: string;
    path: string;
    params: Record<string, string>;
}

export interface DeauthenticatedPayload {
    navigation?: ResourcePath;
}

// Connection STatus

export enum ConnectionStatus {
    NONE = 'NONE',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    ERROR = 'ERROR',
}

export interface ConnectionStateBase {
    status: ConnectionStatus;
}

export interface ConnectionStateNone extends ConnectionStateBase {
    status: ConnectionStatus.NONE;
}

export interface ConnectionStateConnecting extends ConnectionStateBase {
    status: ConnectionStatus.CONNECTING;
    receiveChannel: ReceiveChannel;
    sendChannel: SendChannel;
}

export interface ConnectionStateConnected extends ConnectionStateBase {
    status: ConnectionStatus.CONNECTED;
    receiveChannel: ReceiveChannel;
    sendChannel: SendChannel;
}

export interface ConnectionStateError extends ConnectionStateBase {
    status: ConnectionStatus.ERROR;
    message: string;
}

export type ConnectionState =
    | ConnectionStateNone
    | ConnectionStateConnecting
    | ConnectionStateConnected
    | ConnectionStateError;

export interface EuropaConnectionConstructorParams {
    //   europaWindow: Window;
    //   europaOrigin: string;
    //   initialChannelId: string;
    config: Config;
    messenger: Messenger;
    onDeauthenticated: (payload: DeauthenticatedPayload) => void;
    onAuthenticated: (payload: EuropaAuthenticatedPayload) => void;
    onAuthNavigate: (payload: AuthNavigatePayload) => void;
    spyOnMessages?: boolean;
    //   onEuropaConnect: (payload: EuropaConnectPayload) => Promise<void>;
}

export default class EuropaConnection {
    //   connectionState: ConnectionState;
    connectionStatus: ConnectionStatus;
    params: EuropaConnectionConstructorParams;
    receiveChannel: ReceiveChannel;
    sendChannel: SendChannel;
    constructor(params: EuropaConnectionConstructorParams) {
        this.params = params;

        this.connectionStatus = ConnectionStatus.NONE;

        const receiveSpy = (() => {
            return (message: ChannelMessage, extra?: unknown) => {
                console.info(
                    '[EuropaConnection][spy][RECEIVE] ->',
                    message,
                    extra,
                );
            };
        })();

        this.receiveChannel = new ReceiveChannel({
            window,
            expectedOrigin: this.europaOrigin(),
            channel: uuidv4(),
            spy: this.params.spyOnMessages ? receiveSpy : undefined,
        });

        const sendSpy = (() => {
            return (message: ChannelMessage, extra?: unknown) => {
                console.info(
                    '[EuropaConnection][spy][SEND] ->',
                    message,
                    extra,
                );
            };
        })();

        this.sendChannel = new SendChannel({
            window: this.europaWindow(),
            targetOrigin: this.europaOrigin(),
            channel: this.getChannelId(),
            spy: this.params.spyOnMessages ? sendSpy : undefined,
        });
    }

    /**
     * We need the origin of Europa in order to send it messages.
     * The origin will always be either the
     *
     * @returns
     */
    //   sendMessageOrigin(): string {
    //     // ignore the "insecure" for now.
    //     // return this.insecureParent || this.europaTargetOrigin;
    //     const url = new URL(window.location.href);
    //     url.hostname = window.location.hostname.split('.').slice(-3).join('.');

    //     // return window.location.origin.replace('legacy.', '');
    //     return url.origin;
    //   }

    /**
     * We need the origin of Europa in order to send it messages.
     * The origin will always be either the
     *
     * @returns
     */
    europaOrigin(): string {
        // ignore the "insecure" for now.
        // return this.insecureParent || this.europaTargetOrigin;
        const url = new URL(window.location.href);
        url.hostname = window.location.hostname.split('.').slice(-3).join('.');

        // return window.location.origin.replace('legacy.', '');
        return url.origin;
    }

    europaWindow(): Window {
        return window.parent;
    }

    getChannelId(): string {
        const isSubdomain = window.location.host.split('.').length === 4;
        if (isSubdomain) {
            return 'europa_kbaseui_channel';
        } else {
            const channelIdFromElement =
                window.frameElement!.getAttribute('data-channel-id');
            if (channelIdFromElement === null) {
                throw new Error("The 'data-channel-id' attribute is missing");
            }
            return channelIdFromElement;
        }
    }

    async fetchUserProfile(token: string, username: string) {
        const userModel = new UserProfileClient({
            url: this.params.config.services.UserProfile.url,
            timeout: this.params.config.ui.constants.clientTimeout,
            token,
        });

        const [userProfile] = await userModel.get_user_profile([username]);
        if (userProfile === null) {
            throw new Error(`User not found: ${username}`);
        }
        return userProfile;
    }

    /**
     * Based on a token passed from Europa, authenticate the token and fetch associated
     * account, token, and user profile
     *
     * @param token A kbase Login Token
     * @returns
     */
    async authenticateFromEuropa(token: string): Promise<AuthenticationState> {
        const auth = new Auth2({
            baseUrl: this.params.config.services.Auth2.url,
        });

        try {
            // TODO: can get all three of the following requests at one time...
            const tokenInfo = await auth.getTokenInfo(token);
            const account = await auth.getMe(token);
            if (tokenInfo === null) {
                throw new Error('Authenticating with invalid token.');
            }

            const userProfile = await this.fetchUserProfile(
                token,
                tokenInfo.user,
            );

            return {
                status: AuthenticationStatus.AUTHENTICATED,
                authInfo: {
                    token,
                    tokenInfo,
                    account,
                },
                userProfile,
            };
        } catch (ex) {
            //   return {
            //     status: AuthenticationStatus.UNAUTHENTICATED,
            //   };
            if (ex instanceof JSONRPC11Exception) {
                switch (ex.error.code) {
                    case 10020:
                        throw new Error('Error getting auth info (1)');
                    default:
                        throw new Error('Error getting auth info (2)');
                }
            } else if (ex instanceof AuthError) {
                switch (ex.code) {
                    case '10020':
                        throw new Error('Error getting auth info (3)');
                    default:
                        throw new Error('Error getting auth info (4)');
                }
            } else if (ex instanceof Error) {
                throw new Error('Error getting auth info (5)');
            } else {
                throw new Error('Error getting auth info (6)');
            }
        }
    }

    connect(): Promise<void> {
        // Prepare to receive the start command, with the initial payload from
        // Europa.
        // This event handler should:
        //   - ensure that the payload is valid
        //   - validate auth token if sent
        return new Promise((resolve) => {
            // Europa sends a connect request as well.
            this.receiveChannel.once('europa.connect', (payload: unknown) => {
                // TODO: payload assertion
                const { channelId } = payload as EuropaConnectPayload;

                // Now we can switch the channel to our unique channel id.
                this.sendChannel.setChannelId(channelId);

                this.connectionStatus = ConnectionStatus.CONNECTED;

                // Now we await the message telling us about the authentication state and
                // first navigation.
                this.receiveChannel.once(
                    'europa.authnavigate',
                    async (payload: unknown) => {
                        this.setupListeners();

                        this.params.onAuthNavigate(
                            payload as AuthNavigatePayload,
                        );
                    },
                );

                this.sendChannel.send('kbase-ui.connected', {});

                resolve();
            });

            this.receiveChannel.start();

            // Let Europa know that we are ready, we want to connect.
            this.sendChannel.send('kbase-ui.connect', {
                channel: this.receiveChannel.channel,
            });
        });

        // when receive start, send started
    }

    setupListeners() {
        // Set up handlers for Europa events.

        this.receiveChannel.on('europa.navigate', (payload: unknown) => {
            this.onEuropaNavigation(payload as EuropaNavigationPayload);
        });

        this.receiveChannel.on('europa.authenticated', (payload: unknown) => {
            this.params.onAuthenticated(payload as EuropaAuthenticatedPayload);
        });

        this.receiveChannel.on('europa.deauthenticated', (payload: unknown) => {
            this.params.onDeauthenticated(payload as DeauthenticatedPayload);
        });

        // Listen for hashchange events, forward to Europa.
        // Europa will use this simply to update the local history, and thus the
        // location bar.
        window.addEventListener('hashchange', (event: HashChangeEvent) => {
            // We like to use URL objects when manipulating URLs.
            const newURL = new URL(event.newURL);

            // This function knows how to extract what we need from the URL, especially
            // dealing with how we store params on the fragement itself.
            const { path, params } = urlToNavigationPath(newURL);

            const payload: KBaseUINavigatedMessagePayload = {
                path,
                params,
            };

            this.sendChannel.send('kbase-ui.navigated', payload);
        });

        this.params.messenger.on('session', 'loggedin', (message: unknown) => {
            const { token, expires, nextRequest } = message as {
                token: string;
                expires: number;
                nextRequest?: NextRequestObject;
            };
            this.sendChannel.send('kbase-ui.loggedin', {
                token,
                expires,
                nextRequest,
            });
        });

        this.params.messenger.on('session', 'logout', () => {
            this.sendChannel.send('kbase-ui.logout', {});
        });

        this.params.messenger.on('europa', 'redirect', (message: unknown) => {
            const { url, newWindow } = message as {
                url: string;
                newWindow?: boolean;
            };
            const payload: RedirectMessagePayload = {
                url,
                newWindow,
            };

            this.sendChannel.send('kbase-ui.redirect', payload);
        });
    }

    stop() {}

    disconnect() {
        // this.sendChannel.send('kbase-ui.disconnect', {});
        // this.receiveChannel.stop();
    }

    sendReady() {}

    sendStarted() {}

    // event handleres
    onEuropaNavigation({ path, params }: EuropaNavigationPayload) {
        navigate2({ type: 'kbaseui', path, params });
    }

    setTitle(title: string) {
        this.sendChannel.send('kbase-ui.set-title', { title });
    }
}
