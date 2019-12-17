/*
    App, along with main.js, are the heart of the the hub web app.
    Apps primary responsibilities are:
    - process plugins
    - create, start and populate services
    - create a simple communication bus
    - provide runtime api for config, services, and comm
*/
define([
    'lib/pluginManager',
    'lib/appServiceManager',
    'lib/kbaseServiceManager',
    './runtime',
    'kb_lib/messenger',
    'kb_lib/props',
    'kb_lib/widget/mount',
    'kb_lib/asyncQueue'
], (
    pluginManagerFactory,
    AppServiceManager,
    kbaseServiceManager,
    Runtime,
    Messenger,
    props,
    widgetMount,
    AsyncQueue
) => {
    'use strict';

    /*
    App
    The app is the primary runtime for the entire system. It provides a
    core set of features, including communication, plugins, configuration,
    fallback error handling, and a simple set of predefined root nodes.
    The rest of the web app is crafted out of the plugins which are loaded
    from the configuration.
    Much of what plugin loading involves is interation with services, which is
    usually literally providing a configuration object to the service and allowing
    the service to do its thing.
    This makes for a very small core, in which nearly all of the functionality is
    provided by plugins and services.

    The config object looks like this:
    TODO: add a json spec for it.

    appConfig -
    plugins -
    nodes -

    appConfig
    at the heart of the configurability of the app is the appConfig. This is a
    plain JS object containing

    nodes
    {
        root: {
            selector: <string>
        }
    }

    */


    return class App {
        constructor(params) {
            this.plugins = params.plugins;
            this.services = params.services;
            this.nodes = params.nodes;

            // We simply wrap the incoming props in our venerable Props thing.
            this.appConfig = new props.Props({
                data: params.appConfig
            });

            // The entire ui (from the app's perspective) hinges upon a single
            // root node, which must already be established by the
            // calling code. If this node is absent, we simply fail here.
            this.rootNode = document.querySelector(this.nodes.root.selector);
            if (!this.rootNode) {
                throw new Error('Cannot set root node for selector ' + this.nodes.root.selector);
            }

            // Events

            // Our own event system.
            this.messenger = new Messenger();

            // DOM

            this.rootMount = null;

            // RENDER QUEUE - GET RID OF THIS

            this.renderQueue = new AsyncQueue();

            // SERVICES

            this.appServiceManager = AppServiceManager.make({
                moduleBasePath: 'app/services'
            });

            this.api = new Runtime({
                config: this.appConfig,
                messenger: this.messenger,
                serviceManager: this.appServiceManager
            });

            this.pluginManager = pluginManagerFactory.make({
                runtime: this.api
            });

            this.addServices(this.services);
        }

        mountRootWidget(widgetId, runtime) {
            if (!this.rootNode) {
                throw new Error('Cannot set root widget without a root node');
            }
            // remove anything on the root mount, such as a waiter.
            this.rootNode.innerHTML = '';
            if (!this.rootMount) {
                // create the root mount.
                this.rootMount = new widgetMount.WidgetMount({
                    node: this.rootNode,
                    runtime,
                    widgetManager: runtime.service('widget').widgetManager
                });
            }
            // ask it to load a widget.
            return this.rootMount.mountWidget(widgetId);
        }

        addServices(services) {
            Object.keys(services).forEach((serviceName) => {
                // A service which is just declared may not have any configuration
                // at all.
                const serviceConfig = JSON.parse(JSON.stringify(services[serviceName]));
                const service = {
                    name: serviceName
                };
                service.module = serviceName;

                // serviceConfig.runtime = api;
                this.appServiceManager.addService(service, serviceConfig);
            });
        }

        checkCoreServices() {
            const manager = new kbaseServiceManager.KBaseServiceManager({
                runtime: this.api
            });
            return manager.check();
        }

        start() {
            // Behavior
            // There are not too many global behaviors, and perhaps there should
            // even fewer or none. Most behavior is within services or
            // active widgets themselves.

            // TODO: replace this with call to mount a page not found panel
            // rather than routing... This will preserve the url and ease the life
            // of developers around the world.
            this.messenger.receive({
                channel: 'app',
                message: 'route-not-found',
                handler: (info) => {
                    this.messenger.send({
                        channel: 'app',
                        message: 'navigate',
                        data: {
                            path: 'message/error/notfound',
                            params: {
                                info: JSON.stringify(info)
                            },
                            replace: true
                        }
                    });
                }
            });

            // UI should be a service...
            // NB this was never developed beyond this stage, and should
            // probably be hunted down and removed.
            this.messenger.receive({
                channel: 'ui',
                message: 'render',
                handler: (arg) => {
                    this.renderQueue.addItem({
                        onRun: () => {
                            if (arg.node) {
                                arg.node.innerHTML = arg.content;
                            } else {
                                console.error('ERROR');
                                console.error('Invalid node for ui/render');
                            }
                        }
                    });
                }
            });

            return this.appServiceManager
                .loadServices({
                    runtime: this.api
                })
                .then(() => {
                    return this.pluginManager.installPlugins(this.plugins);
                })
                .then(() => {
                    return this.checkCoreServices();
                })
                .then(() => {
                    return this.appServiceManager.startServices();
                })
                .then(() => {
                    return this.mountRootWidget('root', this.api);
                })
                .then(() => {
                    return this.api;
                });
        }

        stop() {}
    };
});
