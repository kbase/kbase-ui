define([
    'kb_lib/html',
    'kb_lib/htmlBuilders',
    './windowChannel',
    'kb_lib/httpUtils'
], (
    html,
    build,
    WindowChannel,
    httpUtils
) => {
    'use strict';

    const t = html.tag,
        div = t('div'),
        span = t('span'),
        iframe = t('iframe');

    const SHOW_LOADING_AFTER = 1000;
    const SHOW_WARNING_AFTER = 5000;
    const SHOW_DIRE_WARNING_AFTER = 30000;

    class Iframe {
        constructor(config) {
            // having the host be configurable means we can also host
            // this plugin somewhere else.
            this.origin = config.origin;
            this.pathRoot = config.pathRoot;
            this.runtime = config.runtime;

            // So we can deterministically find the iframe
            this.id = 'frame_' + html.genId();
            this.coverId = 'cover_' + html.genId();

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
                        flexDirection: 'column',
                        position: 'relative'
                    }
                },
                [
                    div({
                        id: this.coverId,
                        style: {
                            position: 'absolute',
                            top: '0',
                            bottom: '0',
                            left: '0',
                            right: '0',
                            // backgroundColor: 'rgba(200, 200, 200, 0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            // justifyContent: 'center',
                            alignItems: 'center',
                            visibility: 'hidden'
                        }
                    }, [
                        div({
                            class: 'well',
                            style: {
                                marginTop: '20px',
                                minHeight: '4em'
                            }
                        }, [
                            span({
                                dataElement: 'message'
                            }),
                            span({
                                dataElement: 'icon',
                                style: {
                                    marginLeft: '8px'
                                }
                            })
                        ])
                    ]),
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

        showCover(message, icon, color) {
            const cover = document.getElementById(this.coverId);
            if (!cover) {
                console.warn('cover not found, cannot show it');
                return;
            }
            cover.style.visibility = 'visible';
            cover.querySelector('[data-element="message"]').innerText = message;
            if (icon) {
                cover.querySelector('[data-element="icon"]').classList = ['fa', 'fa-2x', 'fa-' + icon, 'fa-spin'].join(' ')
            }
            if (color) {
                cover.querySelector('[data-element="icon"]').style.color = color;
            } else {
                delete cover.querySelector('[data-element="icon"]').style['color'];
            }
        }

        hideCover() {
            const cover = document.getElementById(this.coverId);
            if (!cover) {
                console.warn('cover not found, cannot show it');
                return;
            }
            cover.style.visibility = 'hidden';
        }

        removeCover() {
            const cover = document.getElementById(this.coverId);
            if (!cover) {
                console.warn('No cover found!');
                return;
            }
            cover.parentElement.removeChild(cover);
        }

        attach(node) {
            this.node = node;
            this.node.innerHTML = this.content;
            this.iframe = document.getElementById(this.id);
            this.window = this.iframe.contentWindow;
        }
    }

    class ProcessMonitor {
        constructor({steps, iframe}) {
            this.isReady = false;
            this.currentTimer = null;
            this.steps = steps;
            this.currentStep = 0;
            this.iframe = iframe;
        }

        monitor() {
            const step = this.steps[this.currentStep];
            const start = new Date().getTime();
            this.currentTimer = window.setTimeout(() => {
                if (!this.isReady) {
                    this.iframe.showCover(step.message, step.icon, step.color);
                    this.currentStep += 1;
                    if (this.currentStep < this.steps.length) {
                        this.currentTimer = this.monitor();
                    }
                } else {
                    this.currentTimer = null;
                }
            }, step.time);
        }

        start() {
            this.monitor();
        }

        stop() {
            this.isReady = true;
            if (this.currentTimer) {
                window.clearTimeout(this.currentTimer);
            }
            this.iframe.hideCover();
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
            // Punt over to the auth service
            const t = html.tag;
            const form = t('form');
            const input = t('input');
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

        renderWarning(content) {
        }

        start() {
            const monitor = new ProcessMonitor({
                iframe: this.iframe,
                steps: [
                    {
                        message: 'Loading Plugin...', 
                        icon: 'plug',
                        time: SHOW_LOADING_AFTER
                    },
                    {
                        message: 'Loading Plugin - still loading ...',
                        icon: 'plug',
                        color: '#8a6d3b',
                        time: SHOW_WARNING_AFTER
                    },
                    {
                        message: 'Loading Plugin - your connection appears to be slow, still loading ...',
                        icon: 'plug',
                        color: '#a94442',
                        time: SHOW_DIRE_WARNING_AFTER
                    }
                ]
            });
            monitor.start();

            const ready = () => {
                monitor.stop();
            };

            return new Promise((resolve, reject) => {
                this.setupAndStartChannel();
                this.channel.setWindow(this.iframe.window);
                this.channel.once('ready', 
                    ({ channelId }) => {
                        ready();
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
                    }, );
                    // forward clicks to the parent, to enable closing dropdowns,
                    // etc.

                    this.channel.once('started', () => {
                        resolve();
                    });

                    this.channel.once('start-error', (config) => {
                        reject(new Error(config.message));
                    });
                },
                (error) => {
                    console.error('ERROR!', error.message);
                }, 
                60000);
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
