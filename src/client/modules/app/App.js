/*
    App, along with main.js, are the heart of the the hub web app.
    Apps primary responsibilities are:
    - process plugins
    - create, start and populate services
    - create a simple communication bus
    - provide runtime api for config, services, and comm
*/
define([
    'preact',
    'htm',
    'lib/appletManager',
    'lib/pluginManager',
    'lib/appServiceManager',
    'lib/kbaseServiceManager',
    './runtime',
    'lib/messenger',
    'reactComponents/MainWindow/view'
], (
    preact,
    htm,
    {AppletManager},
    {PluginManager},
    {AppServiceManager},
    kbaseServiceManager,
    {Runtime},
    {Messenger},
    MainWindow
) => {
    const html = htm.bind(preact.h);

    // TODO: make this configurable.
    const CHECK_CORE_SERVICES = false;

    /*
    App
    The app is the primary runtime for the entire system. It provides a
    core set of features, including communication, plugins, configuration,
    fallback error handling, and a simple set of predefined root nodes.
    The rest of the web app is crafted out of the plugins which are loaded
    from the configuration.
    Much of what plugin loading involves is interaction with services, which is
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
            this.applets = params.applets;
            this.services = params.services;
            this.nodes = params.nodes;


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

            // SERVICES
            this.appServiceManager = new AppServiceManager({
                moduleBasePath: 'app/services'
            });

            this.runtime = new Runtime({
                config: params.appConfig,
                messenger: this.messenger,
                serviceManager: this.appServiceManager
            });

            this.pluginManager = new PluginManager({
                runtime: this.runtime
            });

            this.appletManager = new AppletManager({
                runtime: this.runtime
            });

            this.addServices(this.services);
        }

        mountRootComponent() {
            const props = {
                runtime: this.runtime
            };
            const content = html`
                <${MainWindow} ...${props} />
            `;
            preact.render(content, this.rootNode);
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

                this.appServiceManager.addService(service, serviceConfig);
            });
        }

        checkCoreServices() {
            const manager = new kbaseServiceManager.KBaseServiceManager({
                runtime: this.runtime
            });
            return manager.check();
        }

        start() {
            this.messenger.receive({
                channel: 'app',
                message: 'route-not-found',
                handler: (info) => {
                    this.messenger.send({
                        channel: 'app',
                        message: 'navigate',
                        payload: {
                            path: 'message/error/notfound',
                            params: {
                                info: JSON.stringify(info)
                            },
                            replace: true
                        }
                    });
                }
            });

            return this.appServiceManager
                .loadServices({
                    runtime: this.runtime
                })
                .then(() => {
                    if (CHECK_CORE_SERVICES) {
                        return this.checkCoreServices();
                    }
                })
                .then(() => {
                    return this.appServiceManager.startServices({
                        only: ['session']
                    });
                })
                .then(() => {
                    return this.appServiceManager.startServices({
                        except: ['session']
                    });
                })
                .then(() => {
                    return this.appletManager.installApplets(this.applets);
                })
                .then(() => {
                    return this.pluginManager.installPlugins(this.plugins);
                })
                .then(() => {
                    return this.mountRootComponent();
                })
                .then(() => {
                    return this.runtime;
                });
        }

        stop() {}
    };
});
