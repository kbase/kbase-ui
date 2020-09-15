define([
    'preact',
    'htm',
    'uuid',
    './windowChannel',
    'kb_lib/httpUtils',
    './AutoPostForm',
    './IFrame',

    'css!./IFrameController.css'
], (
    preact,
    htm,
    Uuid,
    WindowChannel,
    httpUtils,
    AutoPostForm,
    IFrame
) => {
    'use strict';

    const {h, Component, render } = preact;
    const html = htm.bind(h);

    const SHOW_LOADING_AFTER = 1000;
    const SHOW_SLOW_LOADING_AFTER = 5000;
    const SHOW_SUPER_SLOW_LOADING_AFTER = 30000;

    class IFrameController extends Component {
        constructor(props) {
            super(props);

            const {runtime} = props;

            this.runtime = runtime;

            const id = new Uuid(4).format();
            this.id = `host_ ${id}`;

            this.receivers = [];

            this.channel = new WindowChannel({
                host: document.location.origin
            });

            this.state = {
                loading: 'yes',
            };

            this.loadingTimer = null;
        }

        componentDidMount() {
            this.props.pipe.tap(({view, params}) => {
                const path = params.path || [];
                const message = {
                    view, to: view, path, params
                };
                this.channel.send('navigate', message);
            });
            this.props.pipe.start();

            // Listen for slow loading plugins.
            this.monitorLoad();
        }

        monitorLoad() {
            this.loadingTimer = window.setTimeout(() => {
                this.setState({
                    loading: 'slow'
                });
                this.monitorSlowLoad();
            }, SHOW_LOADING_AFTER);
        }

        monitorSlowLoad() {
            this.loadingTimer = window.setTimeout(() => {
                this.setState({
                    loading: 'veryslow'
                });
                this.monitorSuperSlowLoad();
            }, SHOW_SLOW_LOADING_AFTER);
        }

        monitorSuperSlowLoad() {
            this.loadingTimer = window.setTimeout(() => {
                this.setState({
                    loading: 'superslow'
                });
            }, SHOW_SUPER_SLOW_LOADING_AFTER);
        }

        setupAndStartChannel() {
            this.channel.on('get-auth-status', () => {
                this.channel.send('auth-status', {
                    token: this.runtime.service('session').getAuthToken(),
                    username: this.runtime.service('session').getUsername()
                });
            });

            this.channel.on('get-config', () => {
                this.channel.send('config', {
                    value: this.runtime.rawConfig()
                });
            });

            this.channel.on('add-button', ({ button }) => {
                button.callback = () => {
                    this.channel.send.apply(this.iframeChannel, button.callbackMessage);
                };
                this.runtime.send('ui', 'addButton', button);
            });

            this.channel.on('open-window', ({ url }) => {
                window.location.href = url;
                // window.open(url, name);
            });

            this.channel.on('set-plugin-params', ({ pluginParams }) => {
                if (Object.keys(pluginParams) === 0) {
                    window.location.search = '';
                    return;
                }
                const query = {};
                if (pluginParams.query) {
                    query.query = pluginParams.query;
                }
                if (pluginParams.dataPrivacy && pluginParams.dataPrivacy.length > 0) {
                    query.dataPrivacy = pluginParams.dataPrivacy.join(',');
                }
                if (pluginParams.workspaceTypes && pluginParams.workspaceTypes.length > 0) {
                    query.workspaceTypes = pluginParams.workspaceTypes.join(',');
                }
                if (pluginParams.dataTypes) {
                    query.dataTypes = pluginParams.dataTypes.join(',');
                }

                // prepare the params.
                const queryString = httpUtils.encodeQuery(query);

                const currentLocation = window.location.toString();
                const currentURL = new URL(currentLocation);
                currentURL.search = queryString;
                history.replaceState(null, '', currentURL.toString());
            });

            this.channel.on('send-instrumentation', (instrumentation) => {
                this.runtime.service('instrumentation').send(instrumentation);
            });

            this.channel.on('ui-navigate', (to) => {
                this.runtime.send('app', 'navigate', to);
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

            this.channel.on('set-title', (config) => {
                this.runtime.send('ui', 'setTitle', config.title);
            });

            this.channel.on('ui-auth-navigate', ({ nextRequest, tokenInfo }) => {
                const authSession = this.runtime.service('session').getClient();
                authSession.setSessionCookie(tokenInfo.token, tokenInfo.expires);
                return authSession.evaluateSession().then(() => {
                    this.runtime.send('app', 'navigate', nextRequest);
                });
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
                this.runtime.send('notification', 'notify', notification);
            });

            this.channel.start();
        }

        formPost({ action, params }) {
            const donorNode = document.createElement('div');
            document.body.appendChild(donorNode);
            const props = {
                action, params
            };
            render(html`<${AutoPostForm} ...${props} />`, donorNode);
        }

        setupChannelSends() {
            this.receivers.push(this.runtime.receive('session', 'loggedin', () => {
                this.channel.send('loggedin', {
                    token: this.runtime.service('session').getAuthToken(),
                    username: this.runtime.service('session').getUsername(),
                    realname: this.runtime.service('session').getRealname(),
                    email: this.runtime.service('session').getEmail()
                });
            }));
            this.receivers.push(this.runtime.receive('session', 'loggedout', () => {
                this.channel.send('loggedout', {});
            }));
        }

        setupCommunication(iframeWindow) {
            const ready = () => {
                return;
            };

            return new Promise((resolve, reject) => {
                this.temp_window = iframeWindow;
                this.channel.setWindow(iframeWindow);
                this.setupAndStartChannel();
                this.channel.once('ready',
                    ({ channelId }) => {
                        ready();
                        this.channel.partnerId = channelId;
                        // TODO: narrow and improve the config support for plugins
                        // E.g.
                        // const config = this.runtime.rawConfig();
                        // const pluginConfig = {
                        //     baseURL: config.deploy.services.urlBase,
                        //     services: config.services
                        // };

                        const startMessage = {
                            authorization: {
                                token: this.runtime.service('session').getAuthToken(),
                                username: this.runtime.service('session').getUsername(),
                                realname: this.runtime.service('session').getRealname(),
                                email: this.runtime.service('session').getEmail(),
                                roles: this.runtime.service('session').getRoles().map(({ id }) => {
                                    return id;
                                })
                            },
                            config: this.runtime.rawConfig(),
                            view: this.props.params.view,
                            params: this.props.params.routeParams
                        };

                        this.channel.send('start', startMessage);
                        // Any sends to the channel should only be enabled after the
                        // start message is received.
                        this.setupChannelSends();
                    });

                // Sent by the plugin to indicate that the plugin has finished loading.
                this.channel.once('started', () => {
                    if (this.loadingTimer !== null) {
                        window.clearTimeout(this.loadingTimer);
                        this.loadingTimer = null;
                    }
                    this.setState({
                        loading: null
                    });
                    resolve();
                });

                // Sent by a plugin if it encounters an error and doesn't want to display it
                // itself, or it occurs before it is able to render anything.
                this.channel.once('start-error', (config) => {
                    reject(new Error(config.message));
                });
            },
            (error) => {
                console.error('ERROR!', error.message);
            });
        }

        componentWillUnmount() {
            const currentLocation = window.location.toString();
            const currentURL = new URL(currentLocation);
            currentURL.search = '';
            history.replaceState(null, '', currentURL.toString());

            this.receivers.forEach((receiver) => {
                this.runtime.drop(receiver);
            });

            if (this.channel) {
                this.channel.stop();
                this.channel = null;
            }
        }

        iframeMounted(w) {
            this.setupCommunication(w)
                .then(() => {
                    // TODO: remove because this duplicates start behaviour
                    // In order to do that, plugins which don't route on 'start'
                    // need to be updated.
                    const params = this.props.params.routeParams;
                    const path = params.path || [];
                    const view = this.props.params.view;
                    const message = {
                        path, params, view, to: view
                    };
                    this.channel.send('navigate', message);
                });
        }

        renderIFrame() {
            const props = {
                origin: document.location.origin,
                pathRoot: this.props.pluginPath,
                channelId: this.channel.channelId,
                whenMounted: (w) => {
                    // this.channel.setWindow(this.iframe.window);
                    this.iframeMounted(w);
                },
                hostId: this.id,
                params: this.props.params,
                runtime: this.props.runtime
            };

            return html`
                <${IFrame} ...${props} />
            `;
        }

        renderLoading() {
            if (this.state.loading === null) {
                return;
            }
            let message, color;
            switch (this.state.loading) {
            case 'yes': // don't show anything yet...
                return;
            case 'slow':
                message = 'Loading Plugin...';
                color = 'black';
                break;
            case 'veryslow':
                message = 'Loading Plugin - still loading ...';
                color = '#8a6d3b';
                break;
            case 'superslow':
                message = 'Loading Plugin - your connection appears to be slow, still loading ...';
                color = '#a94442';
                break;
            }
            return html`
            <div className="-cover">
                <div className="well PluginLoading">
                    <span className="fa fa-rotate-225 fa-2x fa-plug"
                          style=${{marginRight: '8px', color: color}}></span>
                    <span>
                        ${message}
                    </span>
                    <span className="fa fa-2x fa-spinner fa-pulse"
                        style=${{marginLeft: '8px'}}></span>
                </div>
            </div>
            `;
        }

        render() {
            return html`
            <div className="IFrameController">
                ${this.renderLoading()}
                ${this.renderIFrame()}
            </div>
            `;
        }
    }

    return IFrameController;
});
