/*global define */
/*jslint
 white: true, browser: true
 */
define([
    'bluebird',
    'kb_common_session',
    'kb_common_pluginManager',
    'kb_common_dom',
    'kb_common_messenger',
    'kb_common_widgetManager',
    'kb_common_widgetMount',
    'kb_service_router',
    'kb_service_menu',
    'kb_common_props',
    'yaml!config/client.yml'
], function (Promise, sessionFactory, pluginManagerFactory,
    dom, messengerFactory,
    widgetManagerFactory, widgetMountFactory, routerServiceFactory, menuServiceFactory,
    props, clientConfig) {
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
            return pluginManager.installPlugins(plugins);
        }

        // Services for plugins



        var widgetManager = widgetManagerFactory.make();
        function widgetServiceFactory() {
            function installWidgets(pluginConfig) {
                return Promise.try(function () {
                    pluginConfig.forEach(function (widgetDef) {
                        widgetManager.addWidget(widgetDef);
                    });
                });
            }
            return {
                pluginHandler: installWidgets
            };
        }

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

        // Heartbeat
        function heartbeatServiceFactory(config) {
            var heartbeat = 0,
                heartbeatTimer,
                runtime = config.runtime;

            function startHeartbeat() {
                heartbeat = 0;
                heartbeatTimer = window.setInterval(function () {
                    heartbeat += 1;
                    runtime.send('app', 'heartbeat', {heartbeat: heartbeat});
                }, 100);
            }
            function stopHeartbeat() {
                if (heartbeatTimer) {
                    window.clearInterval(heartbeatTimer);
                }
            }

            return {
                start: startHeartbeat,
                stop: stopHeartbeat
            };
        }

        // SEssion service:

        function sessionServiceFactory(config) {
            var runtime = config.runtime,
                session = sessionFactory.make({
                    cookieName: 'testSession',
                    loginUrl: 'https://kbase.us/services/authorization/Sessions/Login',
                    cookieMaxAge: 100000
                });


            // Session
            function getAuthToken() {
                return session.getAuthToken();
            }
            function getUsername() {
                return session.getUsername();
            }
            function isLoggedIn() {
                return session.isLoggedIn();
            }
            function login(arg) {
                return session.login(arg)
                    .then(function () {
                        runtime.send('session', 'loggedin');
                    });
            }
            function logout() {
                return session.logout()
                    .then(function () {            
                        runtime.send('session', 'loggedout');
                    });
            }

            return {
                getAuthToken: getAuthToken,
                getUsername: getUsername,
                isLoggedIn: isLoggedIn,
                login: login,
                logout: logout
            };

        }

        // Service proxy
        var services = {};
        function addService(serviceNames, serviceDef) {
            serviceNames.forEach(function (name) {
                services[name] = serviceDef;
            });
        }
        function getService(name) {
            return services[name];
        }



        // Creation tasks
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
            hasConfig: hasConfig,
            // Session
            installPlugins: installPlugins,
            makeWidget: function () {
                return proxyMethod(widgetManager, 'makeWidget', arguments);
            },
            send: send,
            recv: receive,
            drop: drop,
            snd: snd,
            rcv: rcv,
            urcv: urcv,
            // Services
            getService: getService
        };

        

        function begin() {
            // Register service handlers.
            addService(['routes', 'route', 'routing'], routerServiceFactory.make({
                runtime: api,
                notFoundRoute: {redirect: {path: 'message/notfound'}},
                defaultRoute: {redirect: {path: 'hello'}}
            }));
            addService(['menu', 'menus'], menuServiceFactory.make({
                runtime: api
            }));
            addService(['widgets', 'widget'], widgetServiceFactory({
                runtime: api
            }));
            addService(['heartbeat'], heartbeatServiceFactory({
                runtime: api
            }));
            addService(['session'], sessionServiceFactory({
                runtime: api
            }));

            pluginManager = pluginManagerFactory.make({
                runtime: api
            });
            
            // Behavior
            
            receive('session', 'loggedout', function () {
                send('app', 'navigate', 'goodbye');
            });

            // ROUTING



            
            return installPlugins(config.plugins)
                .then(function () {
                    return mountRootWidget('root', api);
                })
                .then(function () {
                    getService('heartbeat').start();
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