define([
    'bluebird',
    'lib/router'
], function (
    Promise,
    routerMod
) {
    'use strict';

    class RouteService {
        constructor(p) {
            const { config, params } = p;
            this.runtime = params.runtime;
            this.router = new routerMod.Router(config);
            this.currentRouteHandler = null;
            this.receivers = [];
            this.eventListeners = [];
        }

        doRoute() {
            let handler;
            try {
                handler = this.router.findCurrentRoute();
            } catch (ex) {
                // console.error(ex);
                if (ex instanceof routerMod.NotFoundException) {
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
                            component: 'reactComponents/NotFound'
                        }
                    };
                } else {
                    throw ex;
                }
            }

            this.runtime.send('route', 'routing', handler);
            this.currentRouteHandler = handler;

            // Ensure that if authorization is enabled for this route, that we have it.
            // If not, route to the login path with the current path encoded as
            // "nextrequest". This ensures that we can close the loop for accessing
            // auth-required endpoints.
            if (handler.route.authorization) {
                if (!this.runtime.service('session').isLoggedIn()) {
                    const loginParams = {
                        source: 'authorization'
                    };
                    if (handler.request.path) {
                        loginParams.nextrequest = JSON.stringify(handler.request);
                    }
                    // TODO refactor-expt: here is where SOMETHING needs to listen for the login event.
                    // This is where we can hook in.
                    this.runtime.send('app', 'navigate', {
                        path: 'login',
                        // path: runtime.feature('auth', 'paths.login'),
                        // TODO: path needs to be the path + params
                        params: loginParams
                    });
                    return;
                }
            }

            // We can also require that the route match at least one role defined in a list.
            if (handler.route.rolesRequired) {
                const roles = this.runtime.service('session').getRoles();
                if (
                    !roles.some((role) => {
                        return handler.route.rolesRequired.some((requiredRole) => {
                            return requiredRole === role.id;
                        });
                    })
                ) {
                    handler = {
                        params: {
                            title: 'Access Error',
                            message:
                                'One or more required roles not available in your account: ' +
                                handler.route.rolesRequired.join(', ')
                        },
                        route: {
                            authorization: false,
                            component: 'reactComponents/Error'
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
            const route = {
                routeHandler: handler
            };
            if (handler.route.redirect) {
                this.runtime.send('app', 'route-redirect', route);
            } else if (handler.route.handler) {
                this.runtime.send('app', 'route-handler', route);
            } else if (handler.route.component) {
                this.runtime.send('app', 'route-component', route);
            } else {
                throw new Error('Not a valid route request');
            }
        }

        installRoute(route, pluginName) {
            if (typeof route.params === 'undefined') {
                route.params = {};
            }
            if (!route.params.plugin) {
                route.params.plugin = pluginName;
            }

            if (route.widget) {
                if (route.widget === 'kb_iframe_loader') {
                    console.warn('DEPRECATION - kb_iframe_loader patch should be refactored to a component', route.params.plugin);
                    delete route.widget;
                    route.component = '/pluginSupport/Plugin';
                    this.router.addRoute(route);
                } else {
                    console.error('widget routes no longer supported', route);
                }
            } else if (route.redirectHandler) {
                this.router.addRoute(route);
            } else if (route.component) {
                this.router.addRoute(route);
            } else {
                route.component = '/pluginSupport/Plugin';
                this.router.addRoute(route);
                // console.error('invalid route', route);
                // throw new lang.UIError({
                //     type: 'ConfigurationError',
                //     name: 'RouterConfigurationError',
                //     source: 'installRoute',
                //     message: 'invalid route',
                //     suggestion: 'Fix the plugin which specified this route.',
                //     data: route
                // });
            }
        }

        installRoutes(routes, pluginName) {
            if (!routes) {
                return;
            }
            routes.map((route) => {
                return this.installRoute(route, pluginName);
            });
        }

        pluginHandler(serviceConfig, pluginConfig, pluginDef) {
            return new Promise((resolve, reject) => {
                try {
                    this.installRoutes(serviceConfig, pluginDef.package.name);
                    resolve();
                } catch (ex) {
                    reject(ex);
                }
            });
        }

        start() {
            this.runtime.receive('app', 'do-route', () => {
                this.doRoute();
            });

            this.runtime.receive('app', 'new-route', (data) => {
                if (data.routeHandler.route.redirect) {
                    this.runtime.send('app', 'route-redirect', data);
                } else if (data.routeHandler.route.component) {
                    this.runtime.send('app', 'route-component', data);
                } else if (data.routeHandler.route.handler) {
                    this.runtime.send('app', 'route-handler', data);
                }
            });

            this.runtime.receive('app', 'route-redirect', (data) => {
                this.runtime.send('app', 'navigate', {
                    path: data.routeHandler.route.redirect.path,
                    params: data.routeHandler.route.redirect.params
                });
            });

            this.runtime.receive('app', 'navigate', (data) => {
                this.router.navigateTo(data);
            });

            this.runtime.receive('app', 'redirect', (data) => {
                this.router.redirectTo(data.url, data.new_window || data.newWindow);
            });

            this.eventListeners.push({
                target: window,
                type: 'hashchange',
                listener: () => {
                    // $(window).on('hashchange', function () {
                    // NB this is called AFTER it has changed. The browser will do nothing by
                    // default
                    this.doRoute();
                }
            });
            this.eventListeners.forEach((listener) => {
                listener.target.addEventListener(listener.type, listener.listener);
            });
        }

        stop() {
            this.receivers.forEach((receiver) => {
                if (receiver) {
                    this.runtime.drop(receiver);
                }
            });
            this.eventListeners.forEach((listener) => {
                listener.target.removeEventListener(listener.type, listener.listener);
            });
        }

        isAuthRequired() {
            if (!this.currentRouteHandler) {
                return false;
            }
            return this.currentRouteHandler.route.authorization;
        }
    }

    return RouteService;
});
