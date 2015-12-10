define([
    'bluebird',
    'kb/common/router',
    'kb/common/lang'
], function (Promise, routerFactory, lang) {
    function factory(config) {
        var runtime = config.runtime,
            router = routerFactory.make(config);

        function doRoute() {
            var handler = router.findCurrentRoute();
            if (!handler) {
                runtime.send('app', 'route-not-found');
            }
            if (handler.route.authorization) {
                if (!runtime.getService('session').isLoggedIn()) {
                    var loginParams = {}
                    if (handler.request.path) {
                        loginParams.nextrequest = JSON.stringify(handler.request);
                    }
                    runtime.send('app', 'navigate', {
                        path: 'login',
                        // TODO: path needs to be the path + params
                        params: loginParams
                    });
                    return;
                }
            }
            var route = {
                routeHandler: handler
            };
            if (handler.route.redirect) {
                runtime.send('app', 'route-redirect', route);
            } else if (handler.route.widget) {
                runtime.send('app', 'route-widget', route);
            } else if (handler.route.handler) {
                runtime.send('app', 'route-handler', route);
            }
            //runtime.send('app', 'new-route', {
            //    routeHandler: handler
            //});
        }
        function installRoute(route) {
            return Promise.try(function () {
                if (route.widget) {
                    // ADD ROUTE WIDGET HERE...
                    router.addRoute(route);
                    return true;
//                    router.addRoute({
//                        path: route.path,
//                        queryParams: route.queryParams,
//                        config: {
//                        },
//                        widget: route.widget
//                    });
                } else if (route.redirectHandler) {
                    router.addRoute(route);
                    return true;
                } else {
                    throw new lang.UIError({
                        type: 'ConfiguratonError',
                        name: 'RouterConfigurationError',
                        source: 'installRoute',
                        message: 'invalid route',
                        suggestion: 'Fix the plugin which specified this route.',
                        data: route
                    });
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
        function pluginHandler(pluginConfig) {
            return installRoutes(pluginConfig);
        }

        runtime.recv('app', 'do-route', function () {
            doRoute();
        });


        runtime.recv('app', 'new-route', function (data) {
            if (data.routeHandler.route.redirect) {
                send('app', 'route-redirect', data);
            } else if (data.routeHandler.route.widget) {
                send('app', 'route-widget', data);
            } else if (data.routeHandler.route.handler) {
                send('app', 'route-handler', data);
            }
        });

        runtime.recv('app', 'route-redirect', function (data) {
            runtime.send('app', 'navigate', {
                path: data.routeHandler.route.redirect.path,
                params: data.routeHandler.route.redirect.params
            });
        });
        
        //runtime.recv('app', 'route-handler', function (data) {
        //    
        //})

        runtime.recv('app', 'navigate', function (data) {
            router.navigateTo(data);
        });

        runtime.recv('app', 'redirect', function (data) {
            router.redirectTo(data.url, data.new_window);
        });

        window.addEventListener('hashchange', function (e) {
            // $(window).on('hashchange', function () {
            // NB this is called AFTER it has changed. The browser will do nothing by
            // default
            doRoute();
        });


        return {
            pluginHandler: pluginHandler
        };
    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
});