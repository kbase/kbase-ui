define([
    'preact',
    'htm',
    'uuid',
    '../lib/kb_lib/windowChannel',
    'kb_lib/httpUtils',
    './AutoPostForm',
    './IFrame',
    'reactComponents/ErrorView',

    'css!./IFrameController.css',
], (
    preact,
    htm,
    {v4: uuidv4},
    {WindowChannelInit},
    httpUtils,
    AutoPostForm,
    IFrame,
    ErrorView,
) => {

    const {h, Component, render} = preact;
    const html = htm.bind(h);

    const SHOW_LOADING_AFTER = 1000;
    const SHOW_SLOW_LOADING_AFTER = 5000;
    const SHOW_SUPER_SLOW_LOADING_AFTER = 30000;

    const PLUGIN_STARTUP_TIMEOUT = 60000;

    class IFrameController extends Component {
        constructor(props) {
            super(props);

            const {runtime} = props;

            this.runtime = runtime;

            const id = uuidv4();
            this.id = `host_ ${id}`;

            this.receivers = [];

            this.channel = null;

            this.hostChannelId = uuidv4();
            this.pluginChannelId = uuidv4();

            this.state = {
                status: 'loading',
            };

            this.loadingTimer = null;
        }

        componentDidMount() {
            // Listen for slow loading plugins.
            this.monitorLoad();
        }

        monitorLoad() {
            this.loadingTimer = window.setTimeout(() => {
                this.setState({
                    status: 'slow',
                });
                this.monitorSlowLoad();
            }, SHOW_LOADING_AFTER);
        }

        monitorSlowLoad() {
            this.loadingTimer = window.setTimeout(() => {
                this.setState({
                    status: 'veryslow',
                });
                this.monitorSuperSlowLoad();
            }, SHOW_SLOW_LOADING_AFTER);
        }

        monitorSuperSlowLoad() {
            this.loadingTimer = window.setTimeout(() => {
                this.setState({
                    status: 'superslow',
                });
            }, SHOW_SUPER_SLOW_LOADING_AFTER);
        }

        setupAndStartChannel(iframeWindow) {
            const chan = new WindowChannelInit({
                id: this.hostChannelId,
                window: iframeWindow,
                host: window.document.location.origin,
            });
            this.channel = chan.makeChannel(this.pluginChannelId);
            this.channel.on('get-auth-status', () => {
                this.channel.send('auth-status', {
                    token: this.runtime.service('session').getAuthToken(),
                    username: this.runtime.service('session').getUsername(),
                });
            });

            this.channel.on('get-config', () => {
                this.channel.send('config', {
                    value: this.runtime.rawConfig(),
                });
            });

            this.channel.on('add-button', ({button}) => {
                button.callback = () => {
                    this.channel.send.apply(this.iframeChannel, button.callbackMessage);
                };
                this.runtime.send('ui', 'addButton', button);
            });

            this.channel.on('open-window', ({url}) => {
                window.location.href = url;
                // window.open(url, name);
            });

            this.channel.on('set-plugin-params', ({pluginParams}) => {
                if (Object.keys(pluginParams).length === 0) {
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

            this.channel.on('set-title', ({title}) => {
                this.runtime.send('ui', 'setTitle', title);
            });

            this.channel.on('ui-auth-navigate', ({nextRequest, tokenInfo}) => {
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

        formPost({action, params}) {
            const donorNode = document.createElement('div');
            document.body.appendChild(donorNode);
            const props = {
                action, params,
            };
            render(html`
                <${AutoPostForm} ...${props}/>`, donorNode);
        }

        setupChannelSends() {
            this.receivers.push(this.runtime.receive('session', 'loggedin', () => {
                this.channel.send('loggedin', {
                    token: this.runtime.service('session').getAuthToken(),
                    username: this.runtime.service('session').getUsername(),
                    realname: this.runtime.service('session').getRealname(),
                    email: this.runtime.service('session').getEmail(),
                });
            }));
            this.receivers.push(this.runtime.receive('session', 'loggedout', () => {
                this.channel.send('loggedout', {});
            }));
        }

        stopLoadingMonitor() {
            if (this.loadingTimer !== null) {
                window.clearTimeout(this.loadingTimer);
                this.loadingTimer = null;
            }
        }

        setupCommunication(iframeWindow) {
            return new Promise((resolve, reject) => {
                this.setupAndStartChannel(iframeWindow);
                this.props.pipe.tap(({view, params, request}) => {
                    const path = params.path || [];
                    const message = {
                        view, to: view, path, params, request,
                    };
                    this.channel.send('navigate', message);
                });
                this.props.pipe.start();
                this.channel.once('ready', PLUGIN_STARTUP_TIMEOUT,
                    ({channelId}) => {
                        this.channel.partnerId = channelId;

                        const params = Object.assign({}, this.props.params.routeParams);
                        params.view = this.props.params.view;

                        const startMessage = {
                            authentication: {
                                token: this.runtime.service('session').getAuthToken(),
                                username: this.runtime.service('session').getUsername(),
                                realname: this.runtime.service('session').getRealname(),
                                email: this.runtime.service('session').getEmail(),
                                roles: this.runtime.service('session').getRoles().map(({id}) => {
                                    return id;
                                }),
                            },
                            // TODO: remove when all plugins converted.
                            authorization: {
                                token: this.runtime.service('session').getAuthToken(),
                                username: this.runtime.service('session').getUsername(),
                                realname: this.runtime.service('session').getRealname(),
                                email: this.runtime.service('session').getEmail(),
                                roles: this.runtime.service('session').getRoles().map(({id}) => {
                                    return id;
                                }),
                            },
                            config: this.runtime.rawConfig(),
                            view: this.props.params.view.value,
                            params,
                        };
                        this.channel.send('start', startMessage);
                        // Any sends to the channel should only be enabled after the
                        // start message is received.
                        this.setupChannelSends();
                    });

                // Sent by the plugin to indicate that the plugin has finished loading.
                this.channel.once('started', PLUGIN_STARTUP_TIMEOUT, () => {
                    this.stopLoadingMonitor();
                    resolve();
                });

                // Sent by a plugin if it encounters an error and doesn't want to display it
                // itself, or it occurs before it is able to render anything.
                this.channel.once('start-error', PLUGIN_STARTUP_TIMEOUT, (config) => {
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
            return this.setupCommunication(w)
                .then(() => {
                    const params = Object.assign({}, this.props.params.routeParams);
                    const path = params.path || [];
                    const view = this.props.params.view;
                    params.view = view;
                    const message = {
                        path, params, view, to: view,
                    };
                    this.channel.send('navigate', message);
                });
        }

        renderError() {
            if (this.state.status !== 'error') {
                return;
            }

            return html`
                <div style=${{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    <div style=${{flex: '0 0 auto', minWidth: '30em', maxWidth: '60em'}}>
                        <${ErrorView}
                                title="Error Loading Plugin!"
                                description=${this.state.error.description}
                                message=${this.state.error.message}
                                info=${this.state.error.info}
                                remedies=${this.state.error.remedies}
                        />
                    </div>
                </div>
            `;
        }

        renderIFrame() {
            if (this.state.status === 'error') {
                return;
            }
            const props = {
                origin: document.location.origin,
                pathRoot: this.props.pluginPath,
                hostChannelId: this.hostChannelId,
                pluginChannelId: this.pluginChannelId,
                whenMounted: (w) => {
                    this.iframeMounted(w)
                        .then(() => {
                            this.setState({
                                status: 'loaded',
                            });
                        })
                        .catch((err) => {
                            this.stopLoadingMonitor();
                            this.setState({
                                status: 'error',
                                error: {
                                    message: err.message,
                                    description: 'An error was encountered loading the current plugin.',
                                    info: {
                                        pluginName: this.props.pluginName
                                    },
                                    remedies: [
                                        {
                                            title: 'Wait a while and try again',
                                            description: 'This condition may be temporary, e.g. network issues; if you ' +
                                                'wait a period of time and retry, the issue may have been resolved.'
                                        }, {
                                            title: 'Contact KBase Support',
                                            url: 'https://www.kbase.us/support',
                                            description: 'Visit KBase Support to see if other users are experience the '+
                                                'issue, and if not, create a support ticket.'
                                        }
                                    ]
                                },
                            });
                        });
                },
                hostId: this.id,
                params: this.props.params,
                runtime: this.props.runtime,
                original: this.props.original,
            };

            return html`
                <${IFrame} ...${props}/>
            `;
        }

        renderLoading() {
            let message, color;
            switch (this.state.status) {
                case 'loading': // don't show anything yet...
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
                default:
                    return;
            }
            return html`
                <div class="-cover">
                    <div class="well PluginLoading">
                    <span class="fa fa-rotate-225 fa-2x fa-plug"
                          style=${{marginRight: '8px', color}}></span>
                        <span>
                        ${message}
                    </span>
                        <span class="fa fa-2x fa-spinner fa-pulse"
                              style=${{marginLeft: '8px'}}></span>
                    </div>
                </div>
            `;
        }

        render() {
            return html`
                <div class="IFrameController">
                    ${this.renderLoading()}
                    ${this.renderError()}
                    ${this.renderIFrame()}
                </div>
            `;
        }
    }

    return IFrameController;
});