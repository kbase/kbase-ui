/*
    App, along with main.js, are the heart of the the hub web app.
    Apps primary responsibilities are:
    - process plugins
    - create, start and populate services
    - create a simple communication bus
    - provide runtime api for config, services, and comm
*/
define([
    '../lib/pluginManager',
    './runtime',
    'kb_common/messenger',
    'kb_common/props',
    'kb_widget/widgetMount',
    'kb_common/asyncQueue',
    'kb_common/appServiceManager',
], function (
    pluginManagerFactory,
    Runtime,
    messengerFactory,
    Props,
    widgetMountFactory,
    asyncQueue,
    AppServiceManager
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
        var plugins = _config.plugins,
            services = _config.services,
            nodes = _config.nodes;

        // We simply wrap the incoming props in our venerable Props thing.
        var appConfig = Props.make({
            data: _config.appConfig
        });

        // The entire ui (from the app's perspective) hinges upon a single 
        // root node, which must already be establibished by the 
        // calling code. If this node is absent, we simply fail here.
        var rootNode = document.querySelector(nodes.root.selector);
        if (!rootNode) {
            throw new Error('Cannot set root node for selector ' + nodes.root.selector);
        }

        // Events

        // Our own event system. 
        var messenger = messengerFactory.make();

        // DOM

        var rootMount;

        function mountRootWidget(widgetId, runtime) {
            if (!rootNode) {
                throw new Error('Cannot set root widget without a root node');
            }
            // remove anything on the root mount, such as a waiter.
            rootNode.innerHTML = '';
            if (!rootMount) {
                // create the root mount.
                rootMount = widgetMountFactory.make({
                    node: rootNode,
                    runtime: runtime
                });

            }
            // ask it to load a widget.
            return rootMount.mountWidget(widgetId);
        }

        // RENDER QUEUE - GET RID OF THIS

        var renderQueue = asyncQueue.make();

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
                // if (serviceConfig.module) {
                //     service.module = serviceConfig.module;
                // } else {
                //     service.module = serviceName;
                // }
                // var config = appConfig.getItem(['ui', 'services', serviceName], {});
                // TODO does not support paths, but we don't want to keep this mechamism anyway.
                if (serviceConfig.configs) {
                    serviceConfig.configs.forEach(function (configName) {
                        serviceConfig[configName] = appConfig.getItem(configName);
                    });
                    delete serviceConfig.configs;
                }
                serviceConfig.runtime = api;
                appServiceManager.addService(service, serviceConfig);
            });
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

            // ROUTING


            // START IT UP



            return appServiceManager.loadServices()
                .then(function () {
                    return pluginManager.installPlugins(plugins);
                })
                .then(function () {
                    return appServiceManager.startServices();
                })
                .then(function () {
                    return mountRootWidget('root', api);
                })
                .then(function () {
                    // kick off handling of the current route.
                    // api.service('analytics').pageView('/index');
                    // remove the loading status.

                    messenger.send({
                        channel: 'app',
                        message: 'do-route'
                    });
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
