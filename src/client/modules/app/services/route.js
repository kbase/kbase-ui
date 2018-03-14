define([
    'bluebird',
    'kb_common/router',
    'kb_common/lang'
], function (Promise, Router, lang) {
    'use strict';
    function factory(config) {
        var runtime = config.runtime,
            router = Router.make(config),
            receivers = [],
            eventListeners = [];

        function doRoute() {
            var handler;
            try {
                handler = router.findCurrentRoute();
            } catch (ex) {
                console.error(ex);
                if (ex instanceof Router.NotFoundException) {
                    handler = {
                        request: ex.request,
                        original: ex.original,
                        path: ex.path,
                        params: {
                            request: ex.request,
                            original: ex.original,
                            path: ex.path
                        },
                        route: {
                            authorization: false,
                            widget: 'notFound'
                        }
                    };
                } else {
                    throw ex;
                }
            }
            runtime.send('route', 'routing', handler);
            if (handler.route.authorization) {
                if (!runtime.service('session').isLoggedIn()) {
                    var loginParams = {
                        source: 'authorization'
                    };
                    if (handler.request.path) {
                        loginParams.nextrequest = JSON.stringify(handler.request);
                    }
                    runtime.send('app', 'navigate', {
                        path: 'login',
                        // path: runtime.feature('auth', 'paths.login'),
                        // TODO: path needs to be the path + params
                        params: loginParams
                    });
                    return;
                }
            }
            if (handler.route.rolesRequired) {
                var roles = runtime.service('session').getRoles();
                if (!roles.some(function (role) {
                    return handler.route.rolesRequired.some(function (requiredRole) {
                        return requiredRole === role.id;
                    });
                })) {
                    handler = {
                        params: {
                            title: 'Access Error',
                            error: 'One or more required roles not available in your account: ' + handler.route.rolesRequired.join(', ')                           
                        },
                        route: {
                            authorization: false,
                            widget: 'error'
                        }
                    };
                    // throw new Error('One or more required roles not available in your account: ' + handler.route.requiredRoles.join(', '));
                    // throw new lang.UIError({
                    //     type: 'ConfiguratonError',
                    //     name: 'RouterConfigurationError',
                    //     source: 'installRoute',
                    //     message: 'invalid route',
                    //     suggestion: 'Fix the plugin which specified this route.',
                    //     data: route
                    // });
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
        }

        function installRoute(route) {
            return Promise.try(function () {
                if (route.widget) {
                    router.addRoute(route);
                    return true;
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

        function start() {
            runtime.recv('app', 'do-route', function () {
                doRoute();
            });

            runtime.recv('app', 'new-route', function (data) {
                if (data.routeHandler.route.redirect) {
                    runtime.send('app', 'route-redirect', data);
                } else if (data.routeHandler.route.widget) {
                    runtime.send('app', 'route-widget', data);
                } else if (data.routeHandler.route.handler) {
                    runtime.send('app', 'route-handler', data);
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
                router.redirectTo(data.url, data.new_window || data.newWindow);
            });

            eventListeners.push({
                target: window,
                type: 'hashchange',
                listener: function () {
                    // $(window).on('hashchange', function () {
                    // NB this is called AFTER it has changed. The browser will do nothing by
                    // default
                    doRoute();
                }
            });
            eventListeners.forEach(function (listener) {
                listener.target.addEventListener(listener.type, listener.listener);
            });
        }

        function stop() {
            receivers.forEach(function (receiver) {
                if (receiver) {
                    runtime.drop(receiver);
                }
            });
            eventListeners.forEach(function (listener) {
                listener.target.removeEventListener(listener.type, listener.listener);
            });
        }

        return {
            pluginHandler: pluginHandler,
            start: start,
            stop: stop
        };
    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
});
