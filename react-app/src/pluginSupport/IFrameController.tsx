import { Component } from 'react';
import { render } from 'react-dom';
import * as uuid from 'uuid';
import { AuthenticationState, AuthenticationStatus } from '../contexts/Auth';
import { WindowChannel, WindowChannelInit } from '../lib/kb_lib/windowChannel';
import { Messenger } from '../lib/messenger';
import AutoPostForm from './AutoPostForm';
import ErrorView, { ErrorInfo } from '../components/ErrorView';
import IFrame, { IFrameProps } from './IFrame';
// import { Auth2Session } from '../lib/kb_lib/Auth2Session';
import { Config } from '../types/config';
import { Params } from './Plugin';
import { Alert } from 'react-bootstrap';
import './IFrameController.css';
import { isEqual } from '../lib/kb_lib/Utils';
import { changeHash, pushHistory } from '../apps/Navigator/utils/navigation';

export enum PluginLoadingStatus {
    NONE = 'NONE',
    LOADING = 'LOADING',
    LOADING_SLOWLY = 'LOADING_SLOWLY',
    LOADING_VERY_SLOWLY = 'LOADING_VERY_SLOWLY',
    LOADING_SUPER_SLOWLY = 'LOADING_SUPER_SLOWLY',
    ERROR = 'ERROR',
    SUCCESS = 'SUCCESS',
}

export interface PluginLoadingStateBase {
    status: PluginLoadingStatus;
}

export interface PluginLoadingStateNone extends PluginLoadingStateBase {
    status: PluginLoadingStatus.NONE;
}

export interface PluginLoadingStateLoading extends PluginLoadingStateBase {
    status: PluginLoadingStatus.LOADING;
    start: number;
}

export interface PluginLoadingStateLoadingSlowly
    extends PluginLoadingStateBase {
    status: PluginLoadingStatus.LOADING_SLOWLY;
    start: number;
}

export interface PluginLoadingStateLoadingVerySlowly
    extends PluginLoadingStateBase {
    status: PluginLoadingStatus.LOADING_VERY_SLOWLY;
    start: number;
}

export interface PluginLoadingStateLoadingSuperSlowly
    extends PluginLoadingStateBase {
    status: PluginLoadingStatus.LOADING_SUPER_SLOWLY;
    start: number;
}

export interface PluginLoadingStateError extends PluginLoadingStateBase {
    status: PluginLoadingStatus.ERROR;
    error: ErrorInfo;
}

export interface PluginLoadingStateSuccess extends PluginLoadingStateBase {
    status: PluginLoadingStatus.SUCCESS;
}

export type PluginLoadingState =
    | PluginLoadingStateNone
    | PluginLoadingStateLoading
    | PluginLoadingStateLoadingSlowly
    | PluginLoadingStateLoadingVerySlowly
    | PluginLoadingStateLoadingSuperSlowly
    | PluginLoadingStateError
    | PluginLoadingStateSuccess;

export interface IFrameControllerProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
    messenger: Messenger;
    pluginPath: string;
    pluginName: string;
    view: string;
    original: string;
    routeParams: Params;
    key: string;
}

interface IFrameControllerState {
    loadingState: PluginLoadingState;
}

const SHOW_LOADING_AFTER = 1000;
const SHOW_SLOW_LOADING_AFTER = 5000;
const SHOW_SUPER_SLOW_LOADING_AFTER = 30000;
const PLUGIN_STARTUP_TIMEOUT = 60000;

export default class IFrameController extends Component<
    IFrameControllerProps,
    IFrameControllerState
> {
    id: string;
    receivers: Array<any>;
    channel: WindowChannel | null;
    hostChannelId: string;
    pluginChannelId: string;
    loadingTimer: number | null;

    constructor(props: IFrameControllerProps) {
        super(props);

        const id = uuid.v4();
        this.id = `host_ ${id}`;

        this.receivers = [];

        this.channel = null;

        this.hostChannelId = uuid.v4();
        this.pluginChannelId = uuid.v4();

        this.state = {
            loadingState: {
                status: PluginLoadingStatus.NONE,
            },
        };

        this.loadingTimer = null;
    }

    componentDidMount() {
        // Listen for slow loading plugins.
        const start = Date.now();
        this.setState(
            {
                loadingState: {
                    status: PluginLoadingStatus.LOADING,
                    start,
                },
            },
            () => {
                this.monitorLoad(start);
            }
        );
    }

    componentDidUpdate(prevProps: IFrameControllerProps) {
        if (
            prevProps.view !== this.props.view ||
            !isEqual(prevProps.routeParams, this.props.routeParams)
        ) {
            this.channel!.send('navigate', {
                view: this.props.view,
                to: this.props.view,
                params: this.props.routeParams,
                path: this.props.original,
            });
        }
    }

    monitorLoad(start: number) {
        this.loadingTimer = window.setTimeout(() => {
            this.setState(
                {
                    loadingState: {
                        status: PluginLoadingStatus.LOADING_SLOWLY,
                        start,
                    },
                },
                () => {
                    this.monitorSlowLoad(start);
                }
            );
        }, SHOW_LOADING_AFTER);
    }

    monitorSlowLoad(start: number) {
        this.loadingTimer = window.setTimeout(() => {
            this.setState(
                {
                    loadingState: {
                        status: PluginLoadingStatus.LOADING_VERY_SLOWLY,
                        start,
                    },
                },
                () => {
                    this.monitorSuperSlowLoad(start);
                }
            );
        }, SHOW_SLOW_LOADING_AFTER);
    }

    monitorSuperSlowLoad(start: number) {
        this.loadingTimer = window.setTimeout(() => {
            this.setState(
                {
                    loadingState: {
                        status: PluginLoadingStatus.LOADING_SUPER_SLOWLY,
                        start,
                    },
                },
                () => {
                    this.monitorTooLongLoad(start);
                }
            );
        }, SHOW_SUPER_SLOW_LOADING_AFTER);
    }

    monitorTooLongLoad(start: number) {
        const timeout =
            PLUGIN_STARTUP_TIMEOUT -
            (SHOW_LOADING_AFTER +
                SHOW_SLOW_LOADING_AFTER +
                SHOW_SUPER_SLOW_LOADING_AFTER);
        this.loadingTimer = window.setTimeout(() => {
            this.setState({
                loadingState: {
                    status: PluginLoadingStatus.ERROR,
                    error: {
                        message: `Loading timed out after ${
                            Date.now() - start
                        }ms`,
                        description: [],
                    },
                },
            });
        }, timeout);
    }

    setupAndStartChannel(iframeWindow: Window) {
        const chan = new WindowChannelInit({
            id: this.hostChannelId,
            window: iframeWindow,
            host: window.document.location.origin,
        });
        this.channel = chan.makeChannel(this.pluginChannelId);
        this.channel.on('get-auth-status', () => {
            switch (this.props.authState.status) {
                case AuthenticationStatus.NONE:
                case AuthenticationStatus.UNAUTHENTICATED:
                    this.channel!.send('auth-status', {
                        token: null,
                        username: null,
                    });
                    return;
                case AuthenticationStatus.AUTHENTICATED:
                    this.channel!.send('auth-status', {
                        token: this.props.authState.authInfo.token,
                        username: this.props.authState.authInfo.account.user,
                    });
            }
        });

        this.channel.on('get-config', () => {
            this.channel!.send('config', {
                value: this.props.config,
            });
        });

        this.channel.on('open-window', ({ url }) => {
            window.location.href = url;
            // window.open(url, name);
        });

        // this.channel.on('send-instrumentation', (instrumentation) => {
        //     this.runtime.service('instrumentation').send(instrumentation);
        // });

        this.channel.on('ui-navigate', (to) => {
            //
            // OK. here we need to translation the navigation
            // request to an actual navigation.
            // I think in real usage this is only used by a plugin
            // to navigate to the dashboard when they need to exit
            // (e.g. require auth) -- that was the old default behavior,
            // we should probably readdress that.
            //

            // TODO: extract this to runtime.
            const path = ((): string => {
                if (typeof to === 'string') {
                    return to;
                }
                throw new Error('Invalid path');
            })();

            // window.location.hash = `#${path}`;
            changeHash(path);

            // this.props.messenger.send({
            //     channel: 'app',
            //     message: 'navigate',
            //     payload: to,
            // });
        });

        this.channel.on('post-form', (config) => {
            this.formPost(config);
        });

        this.channel.on('clicked', () => {
            window.document.body.click();
        });

        this.channel.on('click', () => {
            window.document.body.click();
        });

        this.channel.on('set-title', ({ title }) => {
            this.props.setTitle(title);
        });

        this.channel.on('ui-auth-navigate', async (message) => {
            const {
                nextRequest,
                tokenInfo: { token },
            } = message;
            try {
                console.log('hmm', nextRequest, message);

                // Set the auth
                switch (this.props.authState.status) {
                    case AuthenticationStatus.NONE:
                        return;
                    case AuthenticationStatus.UNAUTHENTICATED:
                        await this.props.authState.login(token);
                        break;
                    case AuthenticationStatus.AUTHENTICATED:
                        await this.props.authState.logout();
                        break;
                }

                // Redirect
                changeHash(nextRequest.path || 'about');
                // window.location.hash = nextRequest.path || 'about';
            } catch (ex) {
                console.error('YIKES! Error in auth navigation out.', ex);
            }
        });

        /*
            examples:
            {
                type: 'warning',
                id: 'connection',
                icon: 'exclamation-triangle',
                message: message.message,
                description: message.description
            }
            {
                type: 'success',
                id: 'connection',
                icon: 'check',
                message: message.message,
                description: message.description,
                autodismiss: 5000
            }
            */
        this.channel.on('notification', (notification) => {
            this.props.messenger.send({
                channel: 'notification',
                message: 'notify',
                payload: notification,
            });
        });

        this.channel.start();
    }

    formPost({
        action,
        params,
    }: {
        action: string;
        params: { [k: string]: string };
    }) {
        const donorNode = document.createElement('div');
        document.body.appendChild(donorNode);
        const props = {
            action,
            params,
        };
        render(<AutoPostForm {...props} />, donorNode);
    }

    getAuthInfo() {
        switch (this.props.authState.status) {
            case AuthenticationStatus.NONE:
            case AuthenticationStatus.UNAUTHENTICATED:
                return null;
            case AuthenticationStatus.AUTHENTICATED:
                const {
                    token,
                    account: { user, display, email, roles },
                } = this.props.authState.authInfo;
                return {
                    token,
                    username: user,
                    realname: display,
                    email,
                    roles: roles.map(({ id }) => {
                        return id;
                    }),
                };
        }
    }

    setupChannelSends() {
        this.receivers.push(
            this.props.messenger.receive({
                channel: 'session',
                message: 'loggedin',
                handler: () => {
                    // TODO: auth info should be part of message;
                    // probably is ... fix!
                    const authInfo = this.getAuthInfo();
                    if (authInfo === null) {
                        return;
                    }
                    const { token, username, realname, email } = authInfo;
                    this.channel!.send('loggedin', {
                        token,
                        username,
                        realname,
                        email,
                    });
                },
            })
        );
        this.receivers.push(
            this.props.messenger.receive({
                channel: 'session',
                message: 'loggedout',
                handler: () => {
                    this.channel!.send('loggedout', {});
                },
            })
        );
    }

    stopLoadingMonitor() {
        if (this.loadingTimer !== null) {
            window.clearTimeout(this.loadingTimer);
            this.loadingTimer = null;
        }
    }

    setupCommunication(iframeWindow: Window) {
        return new Promise<void>((resolve, reject) => {
            this.setupAndStartChannel(iframeWindow);
            this.channel!.once(
                'ready',
                PLUGIN_STARTUP_TIMEOUT,
                ({ channelId }: { channelId?: string }) => {
                    this.channel!.setPartner(channelId || this.pluginChannelId);

                    const params = Object.assign({}, this.props.routeParams);
                    params.view = this.props.view;

                    const authentication = (() => {
                        switch (this.props.authState.status) {
                            case AuthenticationStatus.NONE:
                            case AuthenticationStatus.UNAUTHENTICATED:
                                return null;
                            case AuthenticationStatus.AUTHENTICATED:
                                const {
                                    token,
                                    account: { user, display, email, roles },
                                } = this.props.authState.authInfo;
                                return {
                                    token,
                                    username: user,
                                    realname: display,
                                    email,
                                    roles: roles.map(({ id }) => {
                                        return id;
                                    }),
                                };
                        }
                    })();

                    // Convert to compatible format.
                    const auth = (() => {
                        if (authentication === null) {
                            return {
                                token: null,
                                username: null,
                            };
                        }
                        return authentication;
                    })();

                    // Convert to compatible format.
                    const config = (() => {
                        const config = this.props.config;
                        const services: { [k: string]: object } = {};
                        for (const [key, value] of Object.entries(
                            config.services
                        )) {
                            services[key] = value;
                            if (value.aliases) {
                                for (const alias of value.aliases) {
                                    services[alias] = value;
                                }
                            }
                        }
                        return {
                            ...config,
                            services,
                        };
                    })();

                    const startMessage = {
                        authentication: auth,
                        // TODO: remove when all plugins converted.
                        authorization: auth,
                        config,
                        view: this.props.view,
                        params: this.props.routeParams,
                    };
                    this.channel!.send('start', startMessage);
                    // Any sends to the channel should only be enabled after the
                    // start message is received.
                    this.setupChannelSends();
                }
            );

            // Sent by the plugin to indicate that the plugin has finished loading.
            this.channel!.once('started', PLUGIN_STARTUP_TIMEOUT, () => {
                this.stopLoadingMonitor();
                // send an additional message according to the auth state.
                if (
                    this.props.authState.status ===
                    AuthenticationStatus.AUTHENTICATED
                ) {
                    const {
                        token,
                        account: { user: username, display: realname, email },
                    } = this.props.authState.authInfo;
                    this.channel!.send('loggedin', {
                        token,
                        username,
                        realname,
                        email,
                    });
                } else {
                    this.channel!.send('loggedout', {});
                }

                this.channel!.send('navigate', {
                    view: this.props.view,
                    to: this.props.view,
                    params: this.props.routeParams,
                    path: this.props.original,
                });
                resolve();
            });

            // Sent by a plugin if it encounters an error and doesn't want to display it
            // itself, or it occurs before it is able to render anything.
            this.channel!.once(
                'start-error',
                PLUGIN_STARTUP_TIMEOUT,
                (config) => {
                    reject(new Error(config.message));
                }
            );
        });
    }

    componentWillUnmount() {
        const currentLocation = window.location.toString();
        const currentURL = new URL(currentLocation);
        currentURL.search = '';
        window.history.replaceState(null, '', currentURL.toString());

        this.receivers.forEach((receiver) => {
            this.props.messenger.drop(receiver);
        });

        if (this.channel) {
            this.channel.stop();
            this.channel = null;
        }
    }

    iframeMounted(w: Window) {
        return this.setupCommunication(w).then(() => {
            const params = Object.assign({}, this.props.routeParams);
            const view = this.props.view;
            params.view = view;
        });
    }

    renderError(state: PluginLoadingStateError) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <div
                    style={{
                        flex: '0 0 auto',
                        minWidth: '30em',
                        maxWidth: '60em',
                    }}
                >
                    <ErrorView
                        title="Error Loading Plugin!"
                        errorInfo={{
                            description: state.error.description,
                            message: state.error.message,
                            info: state.error.info,
                            remedies: state.error.remedies,
                        }}
                    />
                </div>
            </div>
        );
    }

    renderIFrame() {
        const props: IFrameProps = {
            origin: document.location.origin,
            pathRoot: this.props.pluginPath,
            hostChannelId: this.hostChannelId,
            pluginChannelId: this.pluginChannelId,
            whenMounted: async (w: Window | null) => {
                this.stopLoadingMonitor();
                if (w === null) {
                    this.setState({
                        loadingState: {
                            status: PluginLoadingStatus.ERROR,
                            error: {
                                message: 'IFrame window is null!',
                                description: [
                                    'An error was encountered loading the current plugin.',
                                ],
                                info: {
                                    pluginName: this.props.pluginName,
                                },
                                remedies: [
                                    {
                                        title: 'This is an Internal Error',
                                        description: [
                                            'This is an internal error and has no user fixes.',
                                            'Please contact KBase Support to file a ticket to fix this.',
                                        ],
                                    },
                                    {
                                        title: 'Contact KBase Support',
                                        url: 'https://www.kbase.us/support',
                                        description: [
                                            'Visit KBase Support to see if other users have experienced the ' +
                                                'issue, and if not, create a support ticket.',
                                        ],
                                    },
                                ],
                            },
                        },
                    });
                }
                try {
                    await this.iframeMounted(w!);
                } catch (ex) {
                    this.setState({
                        loadingState: {
                            status: PluginLoadingStatus.ERROR,
                            error: {
                                message:
                                    ex instanceof Error
                                        ? ex.message
                                        : 'Unknown error',
                                description: [
                                    'An error was encountered loading the current plugin.',
                                ],
                                info: {
                                    pluginName: this.props.pluginName,
                                },
                                remedies: [
                                    {
                                        title: 'Wait a while and try again',
                                        description: [
                                            'This condition may be temporary, e.g. network issues; if you ' +
                                                'wait a period of time and retry, the issue may have been resolved.',
                                        ],
                                    },
                                    {
                                        title: 'Contact KBase Support',
                                        url: 'https://www.kbase.us/support',
                                        description: [
                                            'Visit KBase Support to see if other users have experienced the ' +
                                                'issue, and if not, create a support ticket.',
                                        ],
                                    },
                                ],
                            },
                        },
                    });
                }

                this.setState({
                    loadingState: {
                        status: PluginLoadingStatus.SUCCESS,
                    },
                });
            },
            params: this.props.routeParams,
            // original is the full hash string
            original: this.props.original,
            config: this.props.config,
        };

        return <IFrame {...props} />;
    }

    renderLoading() {
        let message, color;
        switch (this.state.loadingState.status) {
            case PluginLoadingStatus.NONE:
                return;
            case PluginLoadingStatus.LOADING_SLOWLY:
                message = 'Loading Plugin...';
                color = 'black';
                break;
            case PluginLoadingStatus.LOADING_VERY_SLOWLY:
                message = 'Loading Plugin - still loading ...';
                color = '#8a6d3b';
                break;
            case PluginLoadingStatus.LOADING_SUPER_SLOWLY:
                message =
                    'Loading Plugin - your connection appears to be slow, still loading ...';
                color = '#a94442';
                break;
            default:
                return;
        }
        return (
            <div className="-cover">
                <Alert variant="warning" className="PluginLoading">
                    <span
                        className="fa fa-rotate-225 fa-2x fa-plug"
                        style={{ marginRight: '8px', color: color }}
                    ></span>
                    <span> {message} </span>
                    <span
                        className="fa fa-2x fa-spinner fa-pulse"
                        style={{ marginLeft: '8px' }}
                    ></span>
                </Alert>
            </div>
        );
    }

    renderState() {
        switch (this.state.loadingState.status) {
            case PluginLoadingStatus.NONE: // don't show anything yet...
                return;
            case PluginLoadingStatus.LOADING_SLOWLY:
            case PluginLoadingStatus.LOADING_VERY_SLOWLY:
            case PluginLoadingStatus.LOADING_SUPER_SLOWLY:
                return this.renderLoading();
            case PluginLoadingStatus.ERROR:
                return this.renderError(this.state.loadingState);
            case PluginLoadingStatus.SUCCESS:
                return;
            default:
                return;
        }
    }

    render() {
        return (
            <div className="IFrameController">
                {this.renderState()}
                {this.renderIFrame()}
            </div>
        );
    }
}
