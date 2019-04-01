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
], function (
    pluginManagerFactory,
    AppServiceManager,
    kbaseServiceManager,
    Runtime,
    Messenger,
    props,
    widgetMount,
    AsyncQueue
) {
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
    function factory(_config) {
        // Import the config.
        // TODO: validate all incoming config.
        const plugins = _config.plugins;
        const services = _config.services;
        const nodes = _config.nodes;

        // We simply wrap the incoming props in our venerable Props thing.
        var appConfig = new props.Props({
            data: _config.appConfig
        });

        // The entire ui (from the app's perspective) hinges upon a single
        // root node, which must already be establibished by the
        // calling code. If this node is absent, we simply fail here.
        const rootNode = document.querySelector(nodes.root.selector);
        if (!rootNode) {
            throw new Error('Cannot set root node for selector ' + nodes.root.selector);
        }

        // Events

        // Our own event system.
        const messenger = new Messenger();

        // DOM

        let rootMount;

        function mountRootWidget(widgetId, runtime) {
            if (!rootNode) {
                throw new Error('Cannot set root widget without a root node');
            }
            // remove anything on the root mount, such as a waiter.
            rootNode.innerHTML = '';
            if (!rootMount) {
                // create the root mount.
                rootMount = new widgetMount.WidgetMount({
                    node: rootNode,
                    // runtime: runtime,
                    widgetManager: runtime.service('widget').widgetManager
                });
            }
            // ask it to load a widget.
            return rootMount.mountWidget(widgetId);
        }

        // RENDER QUEUE - GET RID OF THIS

        var renderQueue = new AsyncQueue();

        // SERVICES

        var appServiceManager = AppServiceManager.make({
            moduleBasePath: 'app/services'
        });

        var api = Runtime.make({
            config: appConfig,
            messenger: messenger,
            serviceManager: appServiceManager
        });

        function addServices(services) {
            Object.keys(services).forEach(function (serviceName) {
                // A service which is just declared may not have any configuration
                // at all.
                var serviceConfig = JSON.parse(JSON.stringify(services[serviceName]));
                var service = {
                    name: serviceName
                };
                service.module = serviceName;

                // serviceConfig.runtime = api;
                appServiceManager.addService(service, serviceConfig);
            });
        }

        function checkCoreServices() {
            const manager = new kbaseServiceManager.KBaseServiceManager({
                runtime: api
            });
            return manager.check();
        }

        // PLUGINS

        var pluginManager = pluginManagerFactory.make({
            runtime: api
        });

        addServices(services);

        function start() {
            // Behavior
            // There are not too many global behaviors, and perhaps there should
            // even fewer or none. Most behavior is within services or
            // active widgets themselves.

            // TODO: replace this with call to mount a page not found panel
            // rather than routing... This will preserve the url and ease the life
            // of developers around the world.
            messenger.receive({
                channel: 'app',
                message: 'route-not-found',
                handler: function (info) {
                    messenger.send({
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
            messenger.receive({
                channel: 'ui',
                message: 'render',
                handler: function (arg) {
                    renderQueue.addItem({
                        onRun: function () {
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

            return appServiceManager
                .loadServices({
                    runtime: api
                })
                .then(function () {
                    return pluginManager.installPlugins(plugins);
                })
                .then(() => {
                    return checkCoreServices();
                })
                .then(function () {
                    return appServiceManager.startServices();
                })
                .then(function () {
                    return mountRootWidget('root', api);
                })
                .then(function () {
                    return api;
                });
        }

        function stop() {}

        return {
            config: appConfig,
            addServices: addServices,
            start: start,
            stop: stop
        };
    }
    return {
        make: factory
    };
});
