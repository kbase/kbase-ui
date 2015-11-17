/*global define */
/*jslint
 white: true, browser: true
 */
define([
    'kb_common_pluginManager',
    'kb_common_dom',
    'kb_common_messenger',
    'kb/widget/widgetMount',    
    'kb_common_props',
    'kb_common_asyncQueue',
    'kb_common_appServiceManager',
    'promise',
    'yaml!config/config.yml',
    'require'
], function (pluginManagerFactory,
    dom, messengerFactory,
    widgetMountFactory, 
    props, asyncQueue, AppServiceManager, Promise, clientConfig, req) {
    'use strict';
    
    var moduleVersion = '0.0.1';

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

        var renderQueue = asyncQueue.make();
        
        var appServiceManager = AppServiceManager.make();
        
        function proxyMethod(obj, method, args) {
        if (!obj[method]) {
            throw {
                name: 'UndefinedMethod',
                message: 'The requested method "' + method + '" does not exist on this object',
                suggestion: 'This is a developer problem, not your fault'
            };
        }
        return obj[method].apply(obj, args);
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
            addService: function () {
                 return proxyMethod(appServiceManager, 'addService', arguments);
            },
            loadService: function () {
                return proxyMethod(appServiceManager, 'loadService', arguments);
            },
            getService: function () {
                return proxyMethod(appServiceManager, 'getService', arguments);
            },
            service: function () {
                return proxyMethod(appServiceManager, 'getService', arguments);
            },
            hasService: function () {
                return proxyMethod(appServiceManager, 'hasService', arguments);
            },
            dumpServices: function () {
                return proxyMethod(appServiceManager, 'dumpServices', arguments);
            }
        };
        

        function begin() {
            // Register service handlers.
            appServiceManager.addService('session', {
                runtime: api,
                cookieName: 'kbase_session',
                extraCookieNames: ['kbase_narr_session'],
                loginUrl: 'https://kbase.us/services/authorization/Sessions/Login',
                cookieMaxAge: 100000

            });
            appServiceManager.addService('heartbeat', {
                runtime: api,
                interval: 500
            });
            appServiceManager.addService('route', {
                runtime: api,
                notFoundRoute: {redirect: {path: 'message/notfound'}},
                defaultRoute: {redirect: {path: 'dashboard'}}
            });
            appServiceManager.addService('menu', {
                runtime: api,
                menus: cfg.menus
            });
            appServiceManager.addService('widget', {
                runtime: api
            });
            appServiceManager.addService('service', {
                runtime: api
            });
            appServiceManager.addService('data', {
                runtime: api
            });
//            appServiceManager.addService('type', {
//                runtime: api
//            });
            
            
//            addService(['session'], sessionServiceFactory.make({
//                runtime: api,
//                cookieName: 'kbase_session',
//                extraCookieNames: ['kbase_narr_session'],
//                loginUrl: 'https://kbase.us/services/authorization/Sessions/Login',
//                cookieMaxAge: 100000
//
//            }));
//            addService(['heartbeat'], heartbeatServiceFactory.make({
//                runtime: api
//            }));
//            addService(['routes', 'route', 'routing'], routerServiceFactory.make({
//                runtime: api,
//                notFoundRoute: {redirect: {path: 'message/notfound'}},
//                defaultRoute: {redirect: {path: 'dashboard'}}
//            }));
//            addService(['menu', 'menus'], menuServiceFactory.make({
//                runtime: api
//            }));
//            addService(['widgets', 'widget'], widgetServiceFactory.make({
//                runtime: api
//            }));
//            addService(['service', 'services'], serviceServiceFactory({
//                runtime: api
//            }));
//            addService(['data'], dataServiceFactory.make({
//                runtime: api
//            }));
//            addService(['type', 'types'], typeServiceFactory.make({
//                runtime: api
//            }));
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

            return appServiceManager.loadServices()
                .then(function () {
                    console.log('Services loaded');
                    return installPlugins(config.plugins);
                })
                .then(function () {
                   console.log('Root widget mounted');
                    return appServiceManager.startServices();
                })
                .then(function () {
                    console.log('Plugins installed');
                    return mountRootWidget('root', api);
                })
                .then(function () {
                    // getService('heartbeat').start();
                    console.log('Services started.');
                    // this is a hack for now ... should be a method for service
                    // events to be sent out post root widget mounting.
                    if (appServiceManager.getService('session').isLoggedIn()) {
                        send('session', 'loggedin');
                    } else {
                        send('session', 'loggedout');
                    }
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
        },
        version: function () {
            return moduleVersion;
        }
    };
});