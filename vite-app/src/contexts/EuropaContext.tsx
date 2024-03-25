import { NextRequestObject } from 'lib/NextRequest';
import ReceiveChannel from 'lib/ReceiveChannel';
import SendChannel, { ChannelMessage } from 'lib/SendChannel';
import { SimpleError } from 'lib/SimpleError';
import { AuthError } from 'lib/kb_lib/Auth2Error';
import { JSONRPC11Exception } from 'lib/kb_lib/comm/JSONRPC11/JSONRPC11';
import UserProfileClient, { UserProfile } from 'lib/kb_lib/comm/coreServices/UserProfile';
import { Messenger } from 'lib/messenger';
import { NavigationPath, navigate2 } from 'lib/navigation';
import { Component, PropsWithChildren, RefObject, createContext, createRef } from 'react';
import { Config } from 'types/config';
import { AsyncProcess, AsyncProcessStatus } from '../lib/AsyncProcess';
import { Account, Auth2, TokenInfo } from '../lib/kb_lib/Auth2';
import { urlToNavigationPath } from './RouterContext';

// TODO: restore the timeout?
// const START_TIMEOUT = 10000;

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

export interface MessageData {
  name: string;
  envelope: Envelope;
  payload: any;
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

export function notify({ title, message, variant, autodismiss }: NotifyOptions) {
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

export interface AuthenticatedPayload {
  token: string;
  nextRequest?: NextRequestObject;
}

export interface EuropaNavigationPayload {
  path: string;
  params: Record<string, string>;
}

export interface DeauthenticatedPayload {
  nextRequest: NextRequestObject;
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

export interface AuthenticationStateAuthenticated extends AuthenticationStatusBase {
  status: AuthenticationStatus.AUTHENTICATED;
  authInfo: AuthInfo;
  userProfile: UserProfile;
}

export interface AuthenticationStateUnauthenticated extends AuthenticationStatusBase {
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
  europaOrigin: string;
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
  // TODO: get from the MessengerContext :) :) :)
  // messenger: Messenger;
  // defaultPath: NavigationPath;
}>;

type EuropaWrapperState = EuropaState;

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
export default class EuropaWrapper extends Component<EuropaWrapperProps, EuropaWrapperState> {
  sendChannel: SendChannel | null;
  receiveChannel: ReceiveChannel | null;
  foo: number;
  dedupeRef: RefObject<boolean>;
  constructor(props: EuropaWrapperProps) {
    super(props);

    this.sendChannel = null;
    this.receiveChannel = null;

    this.foo = Date.now();

    this.dedupeRef = createRef();

    this.state = {
      status: AsyncProcessStatus.NONE,
    };
  }

  componentDidMount() {
    if (this.dedupeRef.current) {
      return;
    }
    this.initialize();
  }

  onDeauthenticated({ nextRequest }: DeauthenticatedPayload) {
    if (this.state.status !== AsyncProcessStatus.SUCCESS) {
      return;
    }
    if (this.state.value.authState.status !== AuthenticationStatus.AUTHENTICATED) {
      return;
    }
    this.setState(
      {
        ...this.state,
        value: {
          ...this.state.value,
          authState: {
            status: AuthenticationStatus.UNAUTHENTICATED,
          },
        },
      },
      () => {
        // Europa may send a "next request", or a follow-up url, to display.
        // Typically this is auth2/loggedout. If omitted, the current kbase-ui view
        // will continue being displayed, and may alter itself in response to the
        // change in authentication state.
        if (nextRequest) {
          navigate2(nextRequest.path);
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

  async asyncSetState(newState: EuropaWrapperState): Promise<void> {
    return new Promise((resolve) => {
      this.setState(newState, () => {
        resolve();
      });
    });
  }

  async onAuthenticated({ token, nextRequest }: AuthenticatedPayload) {
    await this.authenticate(token, nextRequest);
  }

  onEuropaNavigation({ path, params }: EuropaNavigationPayload) {
    navigate2({ type: 'kbaseui', path, params });
  }

  async authenticate(token: string, nextRequest?: NextRequestObject) {
    const auth = new Auth2({
      baseUrl: this.props.config.services.Auth2.url,
    });

    if (this.state.status !== AsyncProcessStatus.SUCCESS) {
      return false;
    }

    // TODO: if the auth state is already determined, the token is the same, and
    // not much time has passed, don't bother re-fetching everything...

    try {
      const [tokenInfo, account] = await Promise.all([auth.getTokenInfo(token), auth.getMe(token)]);
      // const tokenInfo = await auth.getTokenInfo(token);
      // const account = await auth.getMe(token);
      if (tokenInfo === null) {
        this.setState({
          status: AsyncProcessStatus.ERROR,
          error: {
            message: `Authenticating with invalid token.`,
          },
        });
        return;
      }

      const userProfile = await this.fetchUserProfile(token, tokenInfo.user);

      this.setState(
        {
          ...this.state,
          value: {
            ...this.state.value,
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
        () => {
          if (nextRequest) {
            navigate2(nextRequest.path);
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
      const message = ex instanceof Error ? ex.message : 'Unknown error';
      console.warn(`europa.authenticate message contained invalid token: ${message}`);
      return {
        status: AuthenticationStatus.UNAUTHENTICATED,
      };
      //   if (ex instanceof JSONRPC11Exception) {
      //     switch (ex.error.code) {
      //       case 10020:
      //         this.setState({
      //           status: AsyncProcessStatus.ERROR,
      //           error: {
      //             message: `[authenticate] Error getting auth info (1)`,
      //           },
      //         });
      //         break;
      //       default:
      //         this.setState({
      //           status: AsyncProcessStatus.ERROR,
      //           error: {
      //             message: `[authenticate] Error getting auth info (2)`,
      //           },
      //         });
      //     }
      //   } else if (ex instanceof AuthError) {
      //     switch (ex.code) {
      //       case '10020':
      //         this.setState({
      //           status: AsyncProcessStatus.ERROR,
      //           error: {
      //             message: `[authenticate] Error getting auth info (3)`,
      //           },
      //         });
      //         break;
      //       default:
      //         this.setState({
      //           status: AsyncProcessStatus.ERROR,
      //           error: {
      //             message: `[authenticate] Error getting auth info (4)`,
      //           },
      //         });
      //     }
      //   } else if (ex instanceof Error) {
      //     this.setState({
      //       status: AsyncProcessStatus.ERROR,
      //       error: {
      //         message: `[authenticate] Error getting auth info (5)`,
      //       },
      //     });
      //   } else {
      //     this.setState({
      //       status: AsyncProcessStatus.ERROR,
      //       error: {
      //         message: `[authenticate] Error getting auth info (6)`,
      //       },
      //     });
      //   }
    }
  }

  async startAuthenticated(token: string, channelId: string, path: NavigationPath) {
    const auth = new Auth2({
      baseUrl: this.props.config.services.Auth2.url,
    });

    try {
      // TODO: can get all three of the following requests at one time...
      const [tokenInfo, account] = await Promise.all([auth.getTokenInfo(token), auth.getMe(token)]);

      if (tokenInfo === null) {
        this.setState({
          status: AsyncProcessStatus.ERROR,
          error: {
            message: `Authenticating with invalid token.`,
          },
        });
        return;
      }

      const userProfile = await this.fetchUserProfile(token, tokenInfo.user);

      this.setState(
        {
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
            config: this.props.config,
            // TODO: fix this
            europaOrigin: 'foo',
            isHosted: window.parent !== window,
            messenger: $GlobalMessenger,
            channelId,
            notify,
            setTitle: this.setTitle.bind(this),
          },
        },
        () => {
          this.runtimeListeners();
          navigate2(path);
        },
      );
    } catch (ex) {
      if (ex instanceof JSONRPC11Exception) {
        switch (ex.error.code) {
          case 10020:
            this.setState({
              status: AsyncProcessStatus.ERROR,
              error: {
                message: `Error getting auth info`,
              },
            });
            break;
          default:
            this.setState({
              status: AsyncProcessStatus.ERROR,
              error: {
                message: `Error getting auth info`,
              },
            });
        }
      } else if (ex instanceof AuthError) {
        switch (ex.code) {
          case '10020':
            this.setState({
              status: AsyncProcessStatus.ERROR,
              error: {
                message: `[startAuthenticated] Error getting auth info`,
              },
            });
            break;
          default:
            this.setState({
              status: AsyncProcessStatus.ERROR,
              error: {
                message: `[startAuthenticated] Error getting auth info`,
              },
            });
        }
      } else if (ex instanceof Error) {
        this.setState({
          status: AsyncProcessStatus.ERROR,
          error: {
            message: `[startAuthenticated] Error getting auth info`,
          },
        });
      } else {
        this.setState({
          status: AsyncProcessStatus.ERROR,
          error: {
            message: `[startAuthenticated] Error getting auth info`,
          },
        });
      }
    }
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
      baseUrl: this.props.config.services.Auth2.url,
    });

    try {
      // TODO: can get all three of the following requests at one time...
      const tokenInfo = await auth.getTokenInfo(token);
      const account = await auth.getMe(token);
      if (tokenInfo === null) {
        throw new Error('Authenticating with invalid token.');
      }

      const userProfile = await this.fetchUserProfile(token, tokenInfo.user);

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

  async onStart({ authToken }: StartPayload, channelId: string) {
    // const path: NavigationPath = { path: initialPath, params: initialParams, type: 'kbaseui', newWindow: false }
    try {
      const authState: AuthenticationState = await (async () => {
        if (authToken) {
          return this.authenticateFromEuropa(authToken);
        } else {
          return {
            status: AuthenticationStatus.UNAUTHENTICATED,
          };
        }
      })();

      this.setState(
        {
          status: AsyncProcessStatus.SUCCESS,
          value: {
            authState,
            config: this.props.config,
            // TODO: sort this out.
            europaOrigin: 'foo',
            isHosted: window.parent !== window,
            messenger: $GlobalMessenger,
            channelId,
            notify: notify,
            setTitle: this.setTitle.bind(this),
          },
        },
        () => {
          this.runtimeListeners();
          this.sendChannel!.send('kbase-ui.started', {});
          // navigate2(path);
          // navigate2(path)
        },
      );
    } catch (ex) {
      this.setState({
        status: AsyncProcessStatus.ERROR,
        error: {
          message: ex instanceof Error ? ex.message : 'Unknown error',
        },
      });
    }
  }

  /**
   * We need the origin of Europa in order to send it messages.
   * The origin will always be either the
   *
   * @returns
   */
  sendMessageOrigin(): string {
    // ignore the "insecure" for now.
    // return this.insecureParent || this.europaTargetOrigin;
    const url = new URL(window.location.href);
    url.hostname = window.location.hostname.split('.').slice(-3).join('.');

    // return window.location.origin.replace('legacy.', '');
    return url.origin;
  }

  setTitle(title: string) {
    if (this.state.status !== AsyncProcessStatus.SUCCESS) {
      return;
    }
    this.sendChannel!.send('kbase-ui.set-title', { title });
  }

  /**
   * Set up all listeners after the connection with europa is established (by the
   * receipt of the 'europa.start' message.)
   */
  runtimeListeners() {
    if (this.state.status !== AsyncProcessStatus.SUCCESS) {
      return;
    }

    // PostMessage from Europa
    // TODO: switch to the ReceiveChannel class.
    // const listener = (message: MessageEvent<MessageData>) => {
    //     // only look at messages which come from the iframe parent

    //     // Must be loaded.
    //     if (this.state.status !== AsyncProcessStatus.SUCCESS) {
    //         console.warn('Not in SUCCESS state, cannot proceed');
    //         return;
    //     }

    //     // We only receive messages from the parent window (owner of the iframe),
    //     // and insist on having a "source" property in the message data.
    //     // TODO: this is a bit ill-defined. Let's use the system well-trod by
    //     // plugins. Use the iframe as the communication bus, and use unique ids to
    //     // establish a stable channel.
    //     if (message.source !== window.parent || !message?.data?.name) {
    //         console.warn('Received message from somewhere other than Europa - ignoring');
    //         return;
    //     }

    //      const {name, envelope, payload} = message.data;

    //     if (typeof name === 'undefined' || typeof envelope === 'undefined' || typeof payload === 'undefined') {
    //         console.warn('This message not intended for Europa / kbase-ui integration (structure)');
    //         return;
    //     }

    //     const {channel} = envelope;

    //     if (channel !== this.state.value.channelId) {
    //         console.warn('This message not intended for Europa / kbase-ui integration (envelope)');
    //         return;
    //     }

    //     switch (name) {
    //         case 'europa.deauthenticated':
    //             this.onDeauthenticated(payload as DeauthenticatedPayload);
    //             break;
    //         case 'europa.authenticated': {
    //             this.onAuthenticated(payload as AuthenticatedPayload);
    //             break;
    //         }
    //     }
    // }
    // window.addEventListener('message', listener);

    // Now that we've received the start message, we can listen on the channel (id)
    // send from the host.

    this.sendChannel = new SendChannel({
      window: window.parent,
      targetOrigin: this.sendMessageOrigin(),
      channel: this.state.value.channelId,
    });

    // This is emitted after a successful sign in or sign up. We let europa know, so
    // it can establish its auth state, and it in turn will send the
    // 'europa.authenticated' message above.
    $GlobalMessenger.on('session', 'loggedin', ({ token, expires, nextRequest }) => {
      this.sendChannel!.send('kbase-ui.loggedin', { token, expires, nextRequest });
    });

    $GlobalMessenger.on('session', 'logout', () => {
      this.sendChannel!.send('kbase-ui.logout', {});
    });

    $GlobalMessenger.on('europa', 'navigate', ({ path, params, type }) => {
      const payload: NavigationMessagePayload = {
        path,
        params,
        type,
      };

      this.sendChannel!.send('kbase-ui.navigation', payload);
    });

    $GlobalMessenger.on('europa', 'redirect', ({ url, newWindow }) => {
      const payload: RedirectMessagePayload = {
        url,
        newWindow,
      };

      this.sendChannel!.send('kbase-ui.redirect', payload);
    });

    /**
     * Captures a hash change and propagates up to the container app, Europa.
     *
     * It is emitted as a "navigation" event, carrying the payload of the path (the
     * hash with the initial # removed) and any search params.
     *
     * Note:
     */
    window.addEventListener('hashchange', (event: HashChangeEvent) => {
      // We like to use URL objects when manipulating URLs.
      const newURL = new URL(event.newURL);

      // This function knows how to extract what we need from the URL, especially
      // dealing with how we store params on the fragement itself.
      const { path, params } = urlToNavigationPath(newURL);

      const payload: NavigationMessagePayload = {
        path,
        params,
      };

      this.sendChannel!.send('kbase-ui.navigation', payload);
    });

    this.receiveChannel!.on('europa.deauthenticated', (payload: any) => {
      this.onDeauthenticated(payload as DeauthenticatedPayload);
    });
    this.receiveChannel!.on('europa.authenticated', (payload: any) => {
      this.onAuthenticated(payload as AuthenticatedPayload);
    });

    this.receiveChannel!.on('europa.navigation', (payload: any) => {
      this.onEuropaNavigation(payload as EuropaNavigationPayload);
    });

    this.receiveChannel!.on('europa.navigation', (payload: any) => {
      this.onEuropaNavigation(payload as EuropaNavigationPayload);
    });
  }

  initialize() {
    if (this.state.status !== AsyncProcessStatus.NONE) {
      return;
    }

    // Is kbase-ui running in an iframe? If not, it is an error.
    if (window.parent === window) {
      this.setState({
        status: AsyncProcessStatus.ERROR,
        error: {
          message: 'kbase-ui not running within an iframe',
        },
      });
      return;
    }

    this.setState(
      {
        status: AsyncProcessStatus.PENDING,
      },
      () => this.initializePending(),
    );
  }

  initializePending() {
    // TODO: a better technique!
    const isSubdomain = window.location.host.split('.').length === 4;
    let channelId: string;
    if (isSubdomain) {
      channelId = 'europa_kbaseui_channel';
    } else {
      const channelIdFromElement = window.frameElement!.getAttribute('data-channel-id');
      if (channelIdFromElement === null) {
        this.setState({
          status: AsyncProcessStatus.ERROR,
          error: {
            message: "The 'data-channel-id' attribute is missing",
          },
        });
        return;
      }
      channelId = channelIdFromElement;
    }

    this.sendChannel = new SendChannel({
      window: window.parent,
      targetOrigin: this.sendMessageOrigin(),
      channel: channelId,
    });
    const spy = (() => {
      return (message: ChannelMessage) => {
        console.info('kbase-ui RECEIVE ->', message);
      };
    })();

    this.receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin: this.sendMessageOrigin(),
      channel: channelId,
      spy,
    });

    // TODO: restore the timeout?
    // this.receiveChannel.once('europa.start', START_TIMEOUT, (payload: any) => {
    this.receiveChannel.once('europa.start', (payload: any) => {
      this.onStart(payload as StartPayload, channelId);
    });

    this.receiveChannel.start();

    // Send a "ready" message to the parent window to indicate that kbase-ui has
    // successfully initialized for Europa integration and is ready to proceed with
    // the requested endpoint.
    this.sendChannel.send('kbase-ui.ready', {
      ready: true,
    });
  }

  render() {
    return <EuropaContext.Provider value={this.state}>{this.props.children}</EuropaContext.Provider>;
  }
}
