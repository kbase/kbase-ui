define([
    'kb_lib/html',
    './windowChannel',
    'kb_lib/httpUtils'
], function (
    html,
    WindowChannel,
    httpUtils
) {
    'use strict';

    const t = html.tag,
        div = t('div'),
        iframe = t('iframe');

    class Iframe {
        constructor(config) {
            // having the host be configurable means we can also host
            // this plugin somewhere else.
            this.origin = config.origin;
            this.pathRoot = config.pathRoot;
            this.runtime = config.runtime;

            // So we can deterministically find the iframe
            this.id = 'frame_' + html.genId();

            const params = {
                frameId: this.id,
                parentHost: document.location.origin,
                buildInfo: this.runtime.config('buildInfo'),
                developMode: false,
                params: config.params,
                channelId: config.channelId
            };

            // All plugins need to follow this pattern for the index for now (but that
            // could be part of the constructor...)
            const indexPath = this.pathRoot + '/iframe_root/index.html';

            // Make an absolute url to this.
            this.url = this.origin + '/' + indexPath + this.cacheBuster();

            // The iframe framework, designed to give a full height and width responsive
            // window with the content area of the ui.
            this.content = div(
                {
                    style: {
                        flex: '1 1 0px',
                        display: 'flex',
                        flexDirection: 'column'
                    }
                },
                [
                    iframe({
                        id: this.id,
                        name: this.id,
                        dataKBTesthookIframe: 'plugin-iframe',
                        dataParams: encodeURIComponent(JSON.stringify(params)),
                        style: {
                            width: '100%',
                            flex: '1 1 0px',
                            display: 'flex',
                            flexDirection: 'column'
                        },
                        frameborder: '0',
                        scrolling: 'no',
                        src: this.url
                    })
                ]
            );

            this.node = null;
        }

        cacheBusterKey(buildInfo, developMode) {
            // NB developMode not implemented yet, so always defaults
            // to the gitCommitHash
            if (developMode) {
                return String(new Date().getTime());
            } else {
                return buildInfo.git.commitHash;
            }
        }

        cacheBuster() {
            // TODO: get develop mode from runtime
            return '?cb=' + this.cacheBusterKey(this.runtime.config('buildInfo'), false);
        }

        attach(node) {
            this.node = node;
            this.node.innerHTML = this.content;
            this.iframe = document.getElementById(this.id);
            this.window = this.iframe.contentWindow;
        }
    }

    class Iframer {
        constructor(config) {
            this.container = config.node;
            this.pluginPath = config.pluginPath;
            this.runtime = config.runtime;
            this.params = config.params;

            this.id = 'host_' + html.genId();

            this.receivers = [];

            // This is the channel for talking to the iframe app.

            // We do a dance here. Creating the channel also creates a unique channel id.
            // The channel will only process messages which contain the message
            // envelope property "to" set to the channel id.
            // So we need to tell the iframe about this through the data-params
            // property.
            // But the channel needs the iframe window reference in order to set up a
            // postMessage listener.
            // Fortunately, the attach method is synchronous, and thus the window object
            // is available immediately after attach().
            // TODO: could instead use a one-time uuid which would be sent in the 'ready'
            // message and matched. Would allow a cleaner logic I suppose.

            this.channel = new WindowChannel.BidirectionalWindowChannel({
                host: document.location.origin
            });

            this.iframe = new Iframe({
                origin: document.location.origin,
                pathRoot: this.pluginPath,
                channelId: this.channel.channelId,
                hostId: this.id,
                params: this.params,
                runtime: this.runtime
            });

            this.iframe.attach(this.container);

            this.channel.setWindow(this.iframe.window);
        }

        // Lifecycle

        /*
        iframe messages lifecycle.

        create iframe, don't set source yet
        set up postmessage listener on the iframe content window
        listem for 'ready' message
        load content for iframe
        content will set up listening on window's postmessage too
        content sends 'ready' message
        host receives ready message and finishes setting up postmessage listener for the
            iframe client
        host sets up all listeners to support client
        life goes on
        when client is being removed e.g. for navigation it is sent the 'stop' message given
            some interval in which to finish this work before it is just axed.
        */

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
                    this.iframeChannel.send.apply(this.iframeChannel, button.callbackMessage);
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
            // var state = JSON.stringify(config.state);
            // let query = {
            //     provider: config.provider,
            //     redirecturl: url,
            //     stayloggedin: config.stayLoggedIn ? 'true' : 'false'
            // };
            // let search = new HttpQuery({
            //     state: JSON.stringify(config.state)
            // }).toString();
            // action = this.makePath(endpoints.loginStart)

            // Punt over to the auth service
            const t = html.tag;
            const form = t('form');
            const input = t('input');
            // const url = document.location.origin + '?' + search;
            const formId = html.genId();
            const paramsInputs = Array.from(Object.entries(params)).map(([name, value]) => {
                return input({
                    type: 'hidden',
                    name: name,
                    value: value
                });
            });
            const content = form(
                {
                    method: 'post',
                    id: formId,
                    action,
                    style: {
                        display: 'hidden'
                    }
                },
                paramsInputs
            );
            const donorNode = document.createElement('div');
            donorNode.innerHTML = content;
            document.body.appendChild(donorNode);

            document.getElementById(formId).submit();
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

        start() {
            return new Promise((resolve, reject) => {
                this.setupAndStartChannel();
                this.channel.setWindow(this.iframe.window);
                this.channel.once('ready', ({ channelId }) => {
                    this.channel.partnerId = channelId;
                    // TODO: narrow and improve the config support for plugins
                    // const config = this.runtime.rawConfig();
                    // const pluginConfig = {
                    //     baseURL: config.deploy.services.urlBase,
                    //     services: config.services
                    // };
                    this.channel.send('start', {
                        authorization: {
                            token: this.runtime.service('session').getAuthToken(),
                            username: this.runtime.service('session').getUsername(),
                            realname: this.runtime.service('session').getRealname(),
                            roles: this.runtime.service('session').getRoles().map(({ id }) => {
                                return id;
                            })
                        },
                        config: this.runtime.rawConfig(),
                        params: this.params.routeParams
                    });
                    // Any sends to the channel should only be enabled after the
                    // start message is received.
                    this.setupChannelSends();
                });
                // forward clicks to the parent, to enable closing dropdowns,
                // etc.

                this.channel.once('started', () => {
                    resolve();
                });

                this.channel.once('start-error', (config) => {
                    reject(new Error(config.message));
                });
            });
        }

        stop() {
            this.container.innerHTML = '';

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
    }

    return Iframer;
});
