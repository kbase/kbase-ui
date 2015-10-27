/*global define */
/*jslint
 white: true, browser: true
 */
define([
    'kb_common_pluginManager',
    'kb_common_dom',
    'kb_common_messenger',
    'kb_common_widgetMount',
    'kb_appService_router',
    'kb_appService_menu',
    'kb_appService_heartbeat',
    'kb_appService_widget',
    'kb_appService_session',
    'kb_appService_data',
    'kb_common_props',
    'kb_common_asyncQueue',
    'promise',
    'yaml!config/client.yml'
], function (pluginManagerFactory,
    dom, messengerFactory,
    widgetMountFactory, routerServiceFactory, menuServiceFactory,
    heartbeatServiceFactory, widgetServiceFactory, sessionServiceFactory,
    dataServiceFactory,
    props, asyncQueue, Promise, clientConfig) {
    'use strict';

    function factory(cfg) {
        var config = cfg,
            pluginManager,
            clientConfigProps = props.make({data: clientConfig});

        function getConfig(prop, defaultValue) {
            return clientConfigProps.getItem(prop, defaultValue);
        }
        function hasConfig(prop) {
            return clientConfigProps.hasItem(prop);
        }



        // Events
//        function publish(channel, message, data) {
//            if (data === undefined) {
//                data = {};
//            }
//            console.log('publishing: ' + channel + ':' + message);
//            return Postal.channel(channel).publish(message, data);
//        }
//        function subscribe(channel, message, fun) {
//            console.log('subscribing: ' + channel + ':' + message);
//            return Postal.channel(channel).subscribe(message, fun);
//        }
//        function unsubscribe(subscription) {
//            return subscription.unsubscribe();
//        }

        // Our own events
        var messenger = messengerFactory.make();
        function receive(channel, message, fun) {
            return rcv({
                channel: channel,
                message: message,
                handler: fun
            });
        }
        function rcv(spec) {
            return messenger.receive(spec);
        }
        function drop(spec) {
            urcv(spec);
        }
        function urcv(spec) {
            return messenger.unreceive(spec);
        }
        function send(channel, message, data) {
            return snd({
                channel: channel,
                message: message,
                data: data
            });
        }
        function snd(spec) {
            return messenger.send(spec);
        }

        // Plugins
        function installPlugins(plugins) {
//            var i = 0;
//            return Promise.each(plugins.map(function (pluginSet) {
//                i += 1;
//                return Promise.try(function () {
//                    console.log('x: SET ' + i);
//                    return pluginManager.installPlugins(pluginSet);
//                });
//            }), function () {});
            return pluginManager.installPluginSets(plugins);
        }

        // Services for plugins





        var rootNode;
        function setRootNode(selector) {
            rootNode = dom.qs(selector);
            if (!rootNode) {
                throw new Error('Cannot set root node for selector ' + selector);
            }

        }
        setRootNode(config.nodes.root.selector);

        var rootMount;
        function mountRootWidget(widgetId, runtime) {
            if (!rootNode) {
                throw new Error('Cannot set root widget without a root node');
            }
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



        // Service registration



        // SEssion service:



        // Service proxy
        var services = {};
        function addService(serviceNames, serviceDef) {
            serviceNames.forEach(function (name) {
                services[name] = serviceDef;
            });
        }
        function startServices() {
            Object.keys(services).forEach(function (name) {
                var service = services[name];
                if (service.start) {
                    try {
                        service.start();
                    } catch (ex) {
                        console.log('ERROR starting service: ' + name);
                        console.log(ex);
                    }   
                }
            })
        }
        function stopServices() {
            
        }
        function hasService(name) {
            if (services[name] === undefined) {
                return false;
            } else {
                return true;
            }
        }
        function getService(name) {
            var service = services[name];
            if (service === undefined) {
                throw {
                    name: 'UndefinedService',
                    message: 'The requested service "' + name +'" has not been registered.',
                    suggestion: 'This is a system configuration issue. The requested service should be installed or the client code programmed to check for its existence first (with hasService)'
                }
            }
            return service;
        }
        
        // Installs a new app service!
        /*
         * given a module, which defines the service, and a name, add the service.
         */
        function serviceServiceFactory (config) {
            var runtime = config.runtime;
            
            function pluginHandler(serviceConfigs) {
                var services = serviceConfigs.map(function (serviceConfig) {
                    return new Promise(function (resolve) {
                        require([serviceConfig.module], function (serviceFactory) {
                            addService([serviceConfig.name], serviceFactory.make({
                                runtime: runtime
                            }));
                            resolve();
                        });
                    });
                });
                return Promise.settle(services);
            }
            
            return {
                pluginHandler: pluginHandler
            };
        }

        var api = {
            getConfig: getConfig,
            config: getConfig,
            hasConfig: hasConfig,
            // Session
            installPlugins: installPlugins,
            send: send,
            recv: receive,
            drop: drop,
            snd: snd,
            rcv: rcv,
            urcv: urcv,
            // Services
            getService: getService,
            service: getService,
            hasService: hasService
        };

        var renderQueue = asyncQueue.make();

        function begin() {
            // Register service handlers.
            addService(['session'], sessionServiceFactory.make({
                runtime: api,
                cookieName: 'kbase_session',
                extraCookieNames: ['kbase_narr_session'],
                loginUrl: 'https://kbase.us/services/authorization/Sessions/Login',
                cookieMaxAge: 100000

            }));
            addService(['heartbeat'], heartbeatServiceFactory.make({
                runtime: api
            }));
            addService(['routes', 'route', 'routing'], routerServiceFactory.make({
                runtime: api,
                notFoundRoute: {redirect: {path: 'message/notfound'}},
                defaultRoute: {redirect: {path: 'dashboard'}}
            }));
            addService(['menu', 'menus'], menuServiceFactory.make({
                runtime: api
            }));
            addService(['widgets', 'widget'], widgetServiceFactory.make({
                runtime: api
            }));           
            addService(['service', 'services'], serviceServiceFactory({
                runtime: api
            }));
            addService(['data'], dataServiceFactory.make({
                runtime: api
            }));
//            addService(['userprofile'], userProfileServiceFactory.make({
//                runtime: api                
//            }));

            

            pluginManager = pluginManagerFactory.make({
                runtime: api
            });

            // Behavior

            receive('session', 'loggedout', function () {
                send('app', 'navigate', 'goodbye');
            });
            
            // UI should be a service...
            
            
            receive('ui', 'render', function (arg) {
                renderQueue.addItem({
                    onRun: function () {
                        if (arg.node) {
                            arg.node.innerHTML = arg.content;
                        } else {
                            console.log('ERROR');
                            console.log('Invalid node for ui/render');
                        }
                    }
                });
               
            });
//            receive('ui', 'setTitle', function (title) {
//                renderQueue.addItem({
//                    send('title', 'set', title);
//                });
//            })

            // ROUTING

            return installPlugins(config.plugins)
                .then(function () {
                    return mountRootWidget('root', api);
                })
                .then(function () {
                    startServices();
                    // getService('heartbeat').start();
                    send('app', 'do-route');
                    return api;
                });
        }
        return {
            begin: begin
        };
    }
    return {
        run: function (config) {
            var runtime = factory(config);
            return runtime.begin();
        }
    };
});