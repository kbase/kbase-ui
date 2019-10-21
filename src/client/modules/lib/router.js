define([], () => {
    'use strict';

    function NotFoundException(request) {
        this.name = 'NotFoundException';
        this.original = request.original;
        this.path = request.path;
        this.params = request.params;
        this.request = request.request;
    }
    NotFoundException.prototype = Object.create(Error.prototype);
    NotFoundException.prototype.constructor = NotFoundException;

    function parseQueryString(s) {
        const fields = s.split(/[?&]/);
        const params = {};
        fields.forEach((field) => {
            if (field.length > 0) {
                const [key, value] = field.split('=');
                if (key.length > 0) {
                    params[decodeURIComponent(key)] = decodeURIComponent(value);
                }
            }
        });
        return params;
    }

    function paramsToQuery(params) {
        return Object.keys(params)
            .map((key) => {
                return key + '=' + encodeURIComponent(params[key]);
            })
            .join('&');
    }

    function getQuery() {
        const query = window.location.search;
        if (!query || query.length === 1) {
            return {};
        }
        return parseQueryString(query.substr(1));
    }

    class Router {
        constructor(config) {
            if (!config.defaultRoute) {
                throw new Error('The defaultRoute must be provided');
            }
            // Routing
            this.routes = [];
            this.defaultRoute = config.defaultRoute;
        }

        addRoute(pathSpec) {
            /*
             * The path spec is an array of elements. Each element is either a
             * string, in which case it is a literal path component,
             * regular expression, which case it is matched on a path component,
             * object with type:param
             */
            /* TODO: do something on overlapping routes */
            /* TODO: better mapping method for routes. */
            /* still, with a relatively short list of routes, this is far from a performance issue. */

            // fix up the path. This business is to make it easier to have
            // compact path specifications.
            let path = pathSpec.path;
            if (typeof path === 'string') {
                path = [path];
            }
            pathSpec.path = path.map((pathElement) => {
                // The default path element, represented by a simple string,
                // is a literal, matched by its value.
                if (typeof pathElement === 'string') {
                    return {
                        type: 'literal',
                        value: pathElement
                    };
                }
                // Otherwise, the path element is represented as a simple
                // object, with property 'type' one of: _____
                // TODO: complete this doc
                if (typeof pathElement === 'object') {
                    if (pathElement instanceof Array) {
                        return {
                            type: 'options',
                            value: pathElement
                        };
                    }
                    if (!pathElement.type) {
                        pathElement.type = 'param';
                    }
                    return pathElement;
                }
                throw new Error('Unsupported route path element');
            });
            this.routes.push(pathSpec);
        }

        getCurrentRequest() {
            let path = [];
            let query2 = {};

            let hash, pathQuery;

            // Also get the query the normal way ...
            const query = getQuery();

            // The path is (for now) from the hash component.
            if (window.location.hash && window.location.hash.length > 1) {
                hash = window.location.hash.substr(1);
                pathQuery = hash.split('?', 2);

                if (pathQuery.length === 2) {
                    query2 = parseQueryString(pathQuery[1]);
                    Object.keys(query2).forEach((key) => {
                        query[key] = query2[key];
                    });
                }
                path = pathQuery[0]
                    .split('/')
                    .filter((pathComponent) => {
                        return pathComponent.length > 0;
                    })
                    .map((pathComponent) => {
                        return decodeURIComponent(pathComponent);
                    });
            }

            return {
                original: hash,
                path: path,
                query: query
            };
        }

        findRoute(req) {
            let foundRoute, j, route, params, requestPathElement, routePathElement;

            // No route at all? Return the default route.
            if (req.path.length === 0 && Object.keys(req.query).length === 0) {
                return {
                    request: req,
                    params: {},
                    route: this.defaultRoute
                };
            }

            routeloop: for (let i = 0; i < this.routes.length; i += 1) {
                route = this.routes[i];
                params = {};

                const captureExtraPath = route.captureExtraPath;

                // We can use a route which is longer than the path if the route has
                // optional params at the end.

                if (route.path.length > req.path.length) {
                    const isAllOptional = route.path.slice(req.path.length).every((routePathElement) => {
                        return routePathElement.optional;
                    });
                    const isCaptureExtraPath = captureExtraPath;
                    const isRest = route.path[route.path.length - 1].type === 'rest';
                    if (!(isAllOptional || isCaptureExtraPath || isRest)) {
                        continue routeloop;
                    }
                } else if (route.path.length < req.path.length) {
                    // A longer path may match if either the route can automatically
                    // capture the rest of the path or the last component is of type 'rest'
                    // TODO: use one or the other, not both!
                    if (!(captureExtraPath || route.path[route.path.length - 1].type === 'rest')) {
                        continue routeloop;
                    }
                }

                reqloop: for (j = 0; j < req.path.length; j += 1) {
                    routePathElement = route.path[j];
                    requestPathElement = req.path[j];
                    if (!routePathElement) {
                        // end of the route path.
                        if (captureExtraPath) {
                            params['rest'] = req.path.slice(j - 1);
                            break;
                        }
                    }
                    switch (routePathElement.type) {
                    case 'literal':
                        // current path element must match current route element
                        if (routePathElement.value !== requestPathElement) {
                            continue routeloop;
                        }
                        break;
                    case 'options':
                        // current path element must match at least one of the
                        // route elements in the "value" property (array).
                        if (
                            !routePathElement.value.some((option) => {
                                if (requestPathElement === option) {
                                    return true;
                                }
                            })
                        ) {
                            continue routeloop;
                        }
                        break;
                    case 'param':
                        // current path element is not compared, it is considered
                        // a positive match, and is stored in the params  map
                        // under the name of the route elements 'name' property.
                        params[routePathElement.name] = requestPathElement;
                        break;
                    case 'regexp':
                        // current path element is matched against a regular expression
                        // defined by the current route element.
                        try {
                            const regexp = new RegExp(routePathElement.regexp);
                            if (!regexp.test(requestPathElement)) {
                                continue routeloop;
                            }
                        } catch (ex) {
                            console.warn('invalid route with regexp element', ex);
                            continue routeloop;
                        }
                        break;
                    case 'rest':
                        // unconditionally matches the rest of the request path, storing it
                        // as an array in a parameter named  by the 'name' property, or
                        // if this is missing or falsy, 'rest'.
                        var name = routePathElement.name || 'rest';
                        if (j < route.path.length - 1) {
                            console.warn('rest parameter used before final route element');
                            console.warn('  being treated as regular param');
                            params[name] = requestPathElement;
                            continue;
                        }

                        if (routePathElement.joinWith) {
                            params[name] = req.path.slice(j).join(routePathElement.joinWith);
                        } else {
                            params[name] = req.path.slice(j);
                        }

                        break reqloop;
                    default:
                        // If the path element is not well formed (not a recognized type)
                        // just skip it with a warning.
                        console.warn('invalid route: type not recognized', routePathElement);
                        continue routeloop;
                    }
                }

                // First found route wins
                // TODO: fix this?
                foundRoute = {
                    request: req,
                    params: params,
                    route: route
                };
                break routeloop;
            }
            // The total params is the path params and query params
            if (foundRoute) {
                const searchParamKeys = Object.keys(req.query);
                const queryParamsSpec = foundRoute.route.queryParams || {};

                // Use the query params spec in the route first. This picks up
                // literals, and also enables the strict query param protocol in
                // which only defined query params are recognized.
                // The captureExtraSearch route flag disables the latter behavior.
                // All undefined query params are simply copied to the req.query.
                Object.keys(queryParamsSpec).forEach((key) => {
                    const param = queryParamsSpec[key];
                    // This allows for supplying a param
                    // from the config.
                    if (param === true) {
                        foundRoute.params[key] = req.query[key];
                    } else if (param.literal) {
                        foundRoute.params[key] = param.literal;
                    } else if (req.query[key] !== undefined) {
                        foundRoute.params[key] = req.query[key];
                    } else {
                        return;
                    }
                    delete searchParamKeys[key];
                });
                if (foundRoute.route.captureExtraSearch) {
                    searchParamKeys.forEach((key) => {
                        foundRoute.params[key] = req.query[key];
                    });
                }
                // Now we handle fixed params; this operate a bit like props. They are specified
                // in the route config, and simply ammend the props passed to the widget.
                // This provides a mechanism for the plugin to directly pass params to the route's
                // widget.
                if (foundRoute.route.params) {
                    Object.assign(foundRoute.params, foundRoute.route.params);
                }
            } else {
                throw new NotFoundException({
                    request: req,
                    params: params,
                    route: null,
                    original: req.original,
                    path: req.path
                });
            }
            return foundRoute;
        }

        findCurrentRoute() {
            const req = this.getCurrentRequest();
            return this.findRoute(req);
        }

        listRoutes() {
            return this.routes.map((route) => {
                return route.path;
            });
        }

        navigateToPath(location) {
            let providedPath, queryString, finalPath;
            if (typeof location.path === 'string') {
                providedPath = location.path.split('/');
            } else if (typeof location.path === 'object' && typeof location.path.push === 'function') {
                providedPath = location.path;
            } else {
                console.error(
                    'Invalid path in location',
                    typeof location.path,
                    location.path instanceof Array,
                    JSON.parse(JSON.stringify(location))
                );
                throw new Error('Invalid path in location');
            }
            // we eliminate empty path components, like extra slashes, or an initial slash.
            const normalizedPath = providedPath
                .filter((element) => {
                    if (!element || typeof element !== 'string') {
                        return false;
                    }
                    return true;
                })
                .join('/');
            if (location.params) {
                queryString = paramsToQuery(location.params);
            }
            // Oops, may be encoded as query
            if (location.query) {
                queryString = paramsToQuery(location.query);
            }
            if (queryString) {
                finalPath = normalizedPath + '?' + queryString;
            } else {
                finalPath = normalizedPath;
            }
            if (location.external) {
                finalPath = '/' + finalPath;
                if (location.replace) {
                    this.replacePath(finalPath);
                } else {
                    // We need to blow away the whole thing, since there will
                    // be a hash there.
                    window.location.href = finalPath;
                }
            } else {
                if (location.replace) {
                    this.replacePath('#' + finalPath);
                } else {
                    window.location.hash = '#' + finalPath;
                }
            }
        }

        navigateTo(location) {
            //if (window.history.pushState) {
            //    window.history.pushState(null, '', '#' + location);
            //} else {
            if (!location) {
                location = this.defaultRoute;
            }
            if (typeof location === 'string') {
                location = { path: location };
            }

            if (location.path !== undefined) {
                this.navigateToPath(location);
            } else if (typeof location.redirect === 'string') {
                this.redirectTo(location.redirect);
            } else {
                throw new Error('Invalid navigation location -- no path');
            }
        }

        replacePath(location) {
            window.location.replace(location);
        }

        redirectTo(location, newWindow) {
            if (newWindow) {
                window.open(location);
            } else {
                window.location.replace(location);
            }
        }
    }

    return {
        NotFoundException,
        Router
    };
});
