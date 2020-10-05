define(["require", "exports", "../../lib/router"], function (require, exports, router_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ServiceClass = exports.RouteService = void 0;
    var RouteService = /** @class */ (function () {
        function RouteService(_a) {
            var config = _a.config, params = _a.params;
            this.runtime = params.runtime;
            this.router = new router_1.Router({
                runtime: params.runtime,
                defaultLocation: config.defaultLocation,
                urls: config.urls
            });
            this.currentRouteHandler = null;
            this.receivers = [];
            this.eventListeners = [];
        }
        RouteService.prototype.doRoute = function () {
            var _this = this;
            var routed = (function () {
                try {
                    var routed_1 = _this.router.findCurrentRoute();
                    var rolesRequired_1 = routed_1.route.rolesRequired;
                    if (rolesRequired_1) {
                        var roles = _this.runtime.service('session').getRoles(); // TODO
                        if (!roles.some(function (role) {
                            return rolesRequired_1.some(function (requiredRole) {
                                return requiredRole === role.id;
                            });
                        })) {
                            return {
                                request: routed_1.request,
                                params: {
                                    title: {
                                        name: 'title',
                                        type: 'string',
                                        value: 'Access Error'
                                    },
                                    message: {
                                        name: 'message',
                                        type: 'string',
                                        value: "One or more required roles not available in your account:" + rolesRequired_1.join(', ')
                                    }
                                },
                                route: {
                                    path: [],
                                    view: '',
                                    authorization: false,
                                    component: 'reactComponents/Error'
                                }
                            };
                        }
                    }
                    return routed_1;
                }
                catch (ex) {
                    if (ex instanceof router_1.NotFoundException) {
                        return {
                            // request: ex.request,
                            // original: ex.original,
                            // path: ex.path,
                            request: ex.request,
                            params: {
                            // request: ex.request,
                            // original: ex.original,
                            },
                            route: {
                                path: [],
                                view: '',
                                authorization: false,
                                component: '/reactComponents/NotFound'
                            }
                        };
                    }
                    else if (ex instanceof router_1.RedirectException) {
                        // TODO: do as redirect route!
                        window.location.href = ex.url;
                        return null;
                    }
                    else if (ex instanceof router_1.NotFoundNoHashException) {
                        // TODO: refactor this, "reason" is just an idea.
                        // return {
                        //     request: {
                        //         path: [],
                        //         query: {},
                        //         realPath: ''
                        //     },
                        //     params: {
                        //         reason: {
                        //             name: 'reason',
                        //             type: 'string',
                        //             value: 'not found no hash'
                        //         }
                        //     },
                        //     route: {
                        //         path: [],
                        //         view: '',
                        //         authorization: false,
                        //         component: '/reactComponents/NotFound'
                        //     }
                        // };
                        _this.runtime.send('app', 'navigate', _this.router.defaultLocation);
                        return null;
                    }
                    else if (ex instanceof router_1.NotFoundHasRealPathException) {
                        return {
                            request: {
                                path: [],
                                query: {},
                                realPath: ex.realPath
                            },
                            params: {
                                reason: {
                                    name: 'reason',
                                    type: 'string',
                                    value: 'has real path'
                                }
                            },
                            route: {
                                path: [],
                                view: '',
                                authorization: false,
                                component: '/reactComponents/NotFound'
                            }
                        };
                    }
                    else {
                        throw ex;
                    }
                }
            })();
            // Already handled!
            if (routed === null) {
                return;
            }
            this.runtime.send('route', 'routing', routed);
            this.currentRouteHandler = routed;
            // Ensure that if authorization is enabled for this route, that we have it.
            // If not, route to the login path with the current path encoded as
            // "nextrequest". This ensures that we can close the loop for accessing
            // auth-required endpoints.
            if (routed.route.authorization) {
                if (!this.runtime.service('session').isAuthenticated()) {
                    var loginParams = {
                        source: 'authorization'
                    };
                    if (routed.request.path) {
                        loginParams.nextrequest = JSON.stringify(routed.request);
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
            var route = {
                routeHandler: routed
            };
            // if (routed.route.) {
            //     this.runtime.send('app', 'route-redirect', route);
            //     // } else if (handler.route.handler) {
            //     //     this.runtime.send('app', 'route-handler', route);
            if (routed.route.component) {
                this.runtime.send('app', 'route-component', route);
            }
            else {
                throw new Error('Not a valid route request');
            }
        };
        RouteService.prototype.installRoute = function (route, options) {
            // TODO: improve typing by route type
            route.pluginName = options.pluginName;
            if (route.component) {
                this.router.addRoute(route, options);
                // } else if (route.redirectHandler) {
                //     this.router.addRoute(route, options);
            }
            else {
                route.component = '/pluginSupport/Plugin';
                this.router.addRoute(route, options);
            }
        };
        RouteService.prototype.installRoutes = function (routes, defaults, options) {
            var _this = this;
            if (!routes) {
                return;
            }
            routes.map(function (route) {
                var resolvedRoute = (function () {
                    if (!defaults) {
                        return route;
                    }
                    console.warn('DEFAULTS', defaults);
                    return route;
                    // Object.keys(defaults)
                    //     .forEach((defaultKey) => {
                    //         if (defaultKey in route) {
                    //             route[defaultKey] = defaults[defaultKey];
                    //         }
                    //     });
                })();
                return _this.installRoute(resolvedRoute, options);
            });
        };
        RouteService.prototype.pluginHandler = function (serviceConfig, pluginConfig, pluginDef) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                try {
                    // We now have service config defaults, at least for routes.
                    var defaults = serviceConfig.defaults || {};
                    // Install all the routes
                    _this.installRoutes(serviceConfig.routes || serviceConfig, defaults, {
                        pluginName: pluginDef.package.name,
                        mode: serviceConfig.mode
                    });
                    resolve();
                }
                catch (ex) {
                    reject(ex);
                }
            });
        };
        RouteService.prototype.start = function () {
            var _this = this;
            this.runtime.receive('app', 'do-route', function () {
                _this.doRoute();
            });
            this.runtime.receive('app', 'new-route', function (data) {
                if (data.routeHandler.route.redirect) {
                    _this.runtime.send('app', 'route-redirect', data);
                }
                else if (data.routeHandler.route.component) {
                    _this.runtime.send('app', 'route-component', data);
                }
                else if (data.routeHandler.route.handler) {
                    _this.runtime.send('app', 'route-handler', data);
                }
            });
            this.runtime.receive('app', 'route-redirect', function (data) {
                _this.runtime.send('app', 'navigate', {
                    path: data.routeHandler.route.redirect.path,
                    params: data.routeHandler.route.redirect.params
                });
            });
            this.runtime.receive('app', 'navigate', function (data) {
                // NEW: convert the legacy naviation location to the
                // new easier-to-type one defined in router.ts
                var location = (function () {
                    var path = data.path || data.url;
                    if (!path) {
                        return {
                            type: 'internal',
                            path: 'dashboard'
                        };
                    }
                    if (typeof path !== 'string') {
                        throw new Error('Invalid value for "path" in location');
                    }
                    if (path.match(/^http[s]?:/)) {
                        return {
                            type: 'external',
                            url: path
                        };
                    }
                    return {
                        type: 'internal',
                        path: path
                    };
                })();
                _this.router.navigateTo(location);
            });
            this.runtime.receive('app', 'redirect', function (_a) {
                var url = _a.url;
                if (!url) {
                    throw new Error('"url" is required for a "redirect" message');
                }
                if (typeof url !== 'string') {
                    throw new Error('"usr" must be a string');
                }
                _this.router.navigateTo({
                    type: 'external',
                    url: url
                });
                // data.url, data.new_window || data.newWindow);
            });
            this.eventListeners.push({
                target: window,
                type: 'hashchange',
                listener: function () {
                    _this.doRoute();
                }
            });
            this.eventListeners.forEach(function (listener) {
                listener.target.addEventListener(listener.type, listener.listener);
            });
            return Promise.resolve();
        };
        RouteService.prototype.stop = function () {
            var _this = this;
            this.receivers.forEach(function (receiver) {
                if (receiver) {
                    _this.runtime.drop(receiver);
                }
            });
            this.eventListeners.forEach(function (listener) {
                listener.target.removeEventListener(listener.type, listener.listener);
            });
            return Promise.resolve();
        };
        RouteService.prototype.isAuthRequired = function () {
            if (!this.currentRouteHandler) {
                return false;
            }
            return this.currentRouteHandler.route.authorization;
        };
        return RouteService;
    }());
    exports.RouteService = RouteService;
    exports.ServiceClass = RouteService;
});
