define([
    'bluebird',
    'kb_common_router',
], function (Promise, routerFactory) {
    function factory(config) {
        var runtime = config.runtime,
            router = routerFactory.make(config);

        function doRoute() {
            var handler = router.findCurrentRoute();
            if (!handler) {
                runtime.send('app', 'route-not-found');
            }
            var route = {
                routeHandler: handler
            };
            if (handler.route.redirect) {
                runtime.send('app', 'route-redirect', route);
            } else if (handler.route.widget) {
                runtime.send('app', 'route-widget', route);
            }
            //runtime.send('app', 'new-route', {
            //    routeHandler: handler
            //});
        }
        function installRoute(route) {
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
        function pluginHandler(pluginConfig) {
            installRoutes(pluginConfig);
        }

        runtime.recv('app', 'do-route', function () {
            doRoute();
        });


        runtime.recv('app', 'new-route', function (data) {
            if (data.routeHandler.route.redirect) {
                send('app', 'route-redirect', data);
            } else if (data.routeHandler.route.widget) {
                send('app', 'route-widget', data);
            }
        });

        runtime.recv('app', 'route-redirect', function (data) {
            runtime.send('app', 'navigate', {
                path: data.routeHandler.route.redirect.path,
                params: data.routeHandler.route.redirect.params
            });
        });

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