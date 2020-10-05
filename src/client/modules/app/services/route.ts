import { JSONObject, JSONValue } from '../../lib/json';
import {
    Router, NotFoundException, RedirectException, RoutingLocation,
    RoutedRequest, NotFoundNoHashException,
    NotFoundHasRealPathException, RouteSpec, RouteOptions,
} from '../../lib/router';
import { Receiver, Runtime, SimpleMap } from '../../lib/types';


type RouteHandler = RoutedRequest;

interface EventListener {
    target: Element | Window,
    type: string,
    listener: () => void;
}

interface ServiceConfig {
    defaults: any; // TODO
    routes: Array<RouteSpec>;
    mode: string;
}

interface PluginConfig {

}

interface PluginDefinition {
    package: {
        name: string;
    };
}

interface RouteServiceConfig {
    defaultLocation: RoutingLocation,
    urls: SimpleMap<string>;
}

interface RouteServiceParams {
    config: RouteServiceConfig;
    params: UIServiceParams;
}

interface UIServiceParams {
    runtime: Runtime;
}

interface Role {
    id: string;
}

export class RouteService {
    runtime: Runtime;
    router: Router;
    currentRouteHandler: RouteHandler | null;
    receivers: Array<Receiver>;
    eventListeners: Array<EventListener>;
    constructor({ config, params }: RouteServiceParams) {
        this.runtime = params.runtime;
        this.router = new Router({
            runtime: params.runtime,
            defaultLocation: config.defaultLocation,
            urls: config.urls
        });
        this.currentRouteHandler = null;
        this.receivers = [];
        this.eventListeners = [];
    }

    doRoute() {
        const routed = ((): RoutedRequest | null => {
            try {
                const routed = this.router.findCurrentRoute();
                const rolesRequired = routed.route.rolesRequired;
                if (rolesRequired) {
                    const roles = this.runtime.service('session').getRoles() as Array<Role>; // TODO
                    if (
                        !roles.some((role) => {
                            return rolesRequired.some((requiredRole) => {
                                return requiredRole === role.id;
                            });
                        })
                    ) {
                        return {
                            request: routed.request,
                            params: {
                                title: {
                                    name: 'title',
                                    type: 'string',
                                    value: 'Access Error'
                                },
                                message: {
                                    name: 'message',
                                    type: 'string',
                                    value: `One or more required roles not available in your account:${rolesRequired.join(', ')}`
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
                return routed;
            } catch (ex) {
                if (ex instanceof NotFoundException) {
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
                } else if (ex instanceof RedirectException) {
                    // TODO: do as redirect route!
                    window.location.href = ex.url;
                    return null;
                } else if (ex instanceof NotFoundNoHashException) {
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
                    this.runtime.send('app', 'navigate', this.router.defaultLocation);
                    return null;
                } else if (ex instanceof NotFoundHasRealPathException) {
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
                } else {
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
                const loginParams: SimpleMap<string> = {
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

        const route = {
            routeHandler: routed
        };
        // if (routed.route.) {
        //     this.runtime.send('app', 'route-redirect', route);
        //     // } else if (handler.route.handler) {
        //     //     this.runtime.send('app', 'route-handler', route);
        if (routed.route.component) {
            this.runtime.send('app', 'route-component', route);
        } else {
            throw new Error('Not a valid route request');
        }
    }

    installRoute(route: RouteSpec, options: RouteOptions) {
        // TODO: improve typing by route type
        route.pluginName = options.pluginName;

        if (route.component) {
            this.router.addRoute(route, options);
            // } else if (route.redirectHandler) {
            //     this.router.addRoute(route, options);
        } else {
            route.component = '/pluginSupport/Plugin';
            this.router.addRoute(route, options);
        }
    }

    installRoutes(routes: Array<RouteSpec>, defaults: RouteSpec, options: RouteOptions) {
        if (!routes) {
            return;
        }
        routes.map((route) => {
            const resolvedRoute: RouteSpec = (() => {
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
            return this.installRoute(resolvedRoute, options);
        });
    }

    pluginHandler(serviceConfig: ServiceConfig, pluginConfig: PluginConfig, pluginDef: PluginDefinition) {
        return new Promise((resolve, reject) => {
            try {
                // We now have service config defaults, at least for routes.
                const defaults = serviceConfig.defaults || {};

                // Install all the routes
                this.installRoutes(serviceConfig.routes || serviceConfig, defaults, {
                    pluginName: pluginDef.package.name,
                    mode: serviceConfig.mode
                });
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
            // NEW: convert the legacy naviation location to the
            // new easier-to-type one defined in router.ts
            const location: RoutingLocation = ((): RoutingLocation => {
                const path = data.path || data.url;
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
                    path
                };
            })();
            this.router.navigateTo(location);
        });

        this.runtime.receive('app', 'redirect', ({ url }) => {
            if (!url) {
                throw new Error('"url" is required for a "redirect" message');
            }
            if (typeof url !== 'string') {
                throw new Error('"usr" must be a string');
            }
            this.router.navigateTo({
                type: 'external',
                url
            });
            // data.url, data.new_window || data.newWindow);
        });

        this.eventListeners.push({
            target: window,
            type: 'hashchange',
            listener: () => {
                this.doRoute();
            }
        });
        this.eventListeners.forEach((listener) => {
            listener.target.addEventListener(listener.type, listener.listener);
        });
        return Promise.resolve();
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
        return Promise.resolve();
    }

    isAuthRequired() {
        if (!this.currentRouteHandler) {
            return false;
        }
        return this.currentRouteHandler.route.authorization;
    }
}

export const ServiceClass = RouteService;
