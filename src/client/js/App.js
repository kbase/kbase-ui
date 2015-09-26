/*global define */
/*jslint
 white: true, browser: true
 */
define([
    'bluebird',
    'utils',
    'postal',
    'kb_common_session',
    'kb_common_pluginManager',
    'kb_common_router',
    'kb_common_dom',
    'kb_common_messenger',
    'kb_common_widgetManager',
    'kb_common_widgetMount',
    'kb_common_observed'
], function (Promise, utils, Postal, sessionFactory, pluginManagerFactory,
    routerFactory, dom, messengerFactory,
    widgetManagerFactory, widgetMountFactory, observed) {
    'use strict';

    function factory(cfg) {
        var authToken,
            config = cfg,
            session = sessionFactory.make({
                cookieName: 'testSession',
                loginUrl: 'https://kbase.us/services/authorization/Sessions/Login',
                cookieMaxAge: 100000
            }),
            pluginManager;

        function getConfig(prop, defaultValue) {
            return null;
        }

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
            return session.login(arg);
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

        var router = routerFactory.make();
        function installRoute(route) {
            console.log('installing route ...');
            console.log(route);
            return Promise.try(function () {
                if (route.widget) {
                    // ADD ROUTE WIDGET HERE...
                    router.addRoute({
                        path: route.path,
                        queryParams: route.queryParams,
                        config: {
                        },
                        widget: route.widget
                    });
                } else if (route.redirectHandler) {
                    router.addRoute(route);
                } else if (route.hello) {
                    router.addRoute({
                        path: route.path,
                        handler: function () {
                            console.log('Hello!');
                        }
                    });
                } else {
                    throw {
                        name: 'RouteConfigurationError',
                        source: 'installRoute',
                        message: 'invalid route',
                        suggestion: 'Fix the plugin which specified this route.',
                        data: route
                    };
                }
            });
        }
        function installRoutes(routes) {
            if (!routes) {
                return;
            }
            return routes.map(function (route) {
                return installRoute(route);
            });
        }


        function menuServiceFactory(config) {
            var state = observed.make(),
                runtime = config.runtime;

            state.setItem('menu', []);
            state.setItem('menus', {
                authenticated: [],
                unauthenticated: []
            });
            state.setItem('menuItems', {
                divider: {
                    type: 'divider'
                }
            });

            function clearMenu() {
                state.setItem('menu', []);
            }
            function addMenuItem(id, menuDef) {
                state.modifyItem('menuItems', function (menuItems) {
                    menuItems[id] = menuDef;
                    return menuItems;
                });
            }

            /*
             function deleteMenuItem(id) {
             delete menu[id];
             }
             function insertMenuItem(id, beforeItem) {
             }
             */
            function setMenu(ids) {
                clearMenu();
                state.setItem('menu', ids.map(function (id) {
                    return id;
                }));
            }

            /*
             * TODO: support menu sections. For now, just a simple menu.
             */
            function addToMenu(id, item) {
                state.modifyItem('menus', function (menus) {
                    menus[id].push(item);
                    return menus;
                });
            }

            function getCurrentMenu() {
                var menu,
                    menus = state.getItem('menus'),
                    menuItems = state.getItem('menuItems');

                if (runtime.isLoggedIn()) {
                    menu = menus['authenticated'];
                } else {
                    menu = menus['unauthenticated'];
                }
                return menu.map(function (item) {
                    return menuItems[item];
                });
            }


            // Plugin interface
            function installMenu(menu) {
                addMenuItem(menu.name, menu.definition);
                if (menu.menus) {
                    menu.menus.forEach(function (menuId) {
                        addToMenu(menuId, menu.name);
                    });
                }
            }

            function pluginHandler(newMenus) {
                if (!newMenus) {
                    return;
                }
                return Promise.try(function () {
                    newMenus.forEach(function (menu) {
                        installMenu(menu);
                    });
                });
            }

            function onChange(fun) {
                state.listen('menu', {
                    onSet: function (value) {
                        fun(getCurrentMenu());
                    }
                });
            }

            // API
            return {
                getCurrentMenu: getCurrentMenu,
                pluginHandler: pluginHandler,
                onChange: onChange
            };
        }

        var widgetManager = widgetManagerFactory.make();
        function widgetServiceFactory() {
            function installWidgets(pluginConfig) {
                return Promise.try(function () {
                    pluginConfig.forEach(function (widgetDef) {
                        widgetManager.addWidget(widgetDef);
                    })
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
            }
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
                }
            }
            return obj[method].apply(obj, args);
        }
        var api = {
            getConfig: getConfig,
            getAuthToken: getAuthToken,
            isLoggedIn: isLoggedIn,
            login: login,
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

        // TODO: move this stuff to router?
        /**
         * A simple adapter to trigger a routing event for the current
         * browser hash-path.
         * 
         * @returns {undefined}
         */
        function doRoute() {
            var handler = router.findCurrentRoute();
            if (!handler) {
                send('app', 'route-not-found');
            }
            send('app', 'new-route', {
                routeHandler: handler
            });
        }
        function navigateTo(location) {
            //if (window.history.pushState) {
            //    window.history.pushState(null, '', '#' + location);
            //} else {
            if (typeof location === 'string') {
                location = {path: location};
            }
            var loc = location.path;
            if (location.params) {
                loc += '?' + paramsToQuery(location.params);

            }

            window.location.hash = '#' + loc;
            //}
        }
        function replacePath(location) {
            window.location.replace(location);
        }
        function redirectTo(location, newWindow) {
            if (newWindow) {
                window.open(location);
            } else {
                window.location.replace(location);
            }
        }


        function begin() {
            var loginOptions = {
                username: 'eapearson',
                password: 'Oc3an1cWhal3',
                disableCookie: true
            };
            /*return session.login(loginOptions)
             .then(function (auth) {
             if (auth) {
             setAuthToken(auth.token);
             return api;
             } else {
             alert('need to log in here');
             throw error.getErrorObject({
             name: 'NoAuth',
             message: 'No Authorization found; Authorization is required for the data api',
             suggestion: 'Umm, there should be a way for the user to log in...'
             });
             }
             });
             */

            // Register service handlers.
            addService(['routes', 'route', 'routing'], {
                pluginHandler: function (pluginConfig) {
                    installRoutes(pluginConfig);
                }
            });
            addService(['menu', 'menus'], menuServiceFactory({
                runtime: api
            }));
            addService(['widgets', 'widget'], widgetServiceFactory({
                runtime: api
            }));
            addService(['heartbeat'], heartbeatServiceFactory({
                runtime: api
            }));

            pluginManager = pluginManagerFactory.make({
                runtime: api
            });

            // ROUTING

            receive('app', 'new-route', function (data) {
                if (data.routeHandler.route.redirect) {
                    send('app', 'route-redirect', data);
                } else if (data.routeHandler.route.widget) {
                    send('app', 'route-widget', data);
                }
            });

            receive('app', 'route-redirect', function (data) {
                send('app', 'navigate', {
                    path: data.routeHandler.route.redirect.path,
                    params: data.routeHandler.route.redirect.params
                });
            });
            
            
            receive('app', 'navigate', function (data) {
                navigateTo(data);
            });

            receive('app', 'redirect', function (data) {
                redirectTo(data.url, data.new_window);
            });

            router.setDefaultRoute({
                redirect: {
                    path: 'message/notfound'
                }
            });


            // window.addEventListener('hashchange', function () {
            $(window).on('hashchange', function () {
                // NB this is called AFTER it has changed. The browser will do nothing by
                // default.
                doRoute();
            });

            return installPlugins(config.plugins)
                .then(function () {
                    return mountRootWidget('root', api);
                })
                .then(function () {
                    getService('heartbeat').start();
                    doRoute();
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