define([], () => {

    class NotFoundException extends Error {
        constructor({original, path, params, request, message}) {
            super(message);
            this.original = original;
            this.path = path;
            this.params = params;
            this.request = request;
            this.name = 'NotFoundException';
        }
    }

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
            this.runtime = config.runtime;
            this.urls = config.urls;
        }

        transformPathSpec(path) {
            // split on query
            const [pathPart, queryPart] = path.split('?');

            // split path
            const pathElements = pathPart.split('/').filter((pathElement) => {
                if (pathElement.trim().length === 0) {
                    return false;
                }
                return true;
            });

            // create path spec
            const pathSpec = pathElements.map((pathElement) => {
                if (pathElement.charAt(0) === ':') {
                    if (pathElement.charAt(1) === '-') {
                        return {
                            type: 'param',
                            name: pathElement.slice(2),
                            optional: true
                        };
                    }
                    return {
                        type: 'param',
                        name: pathElement.slice(1),
                        optional: false
                    };
                }
                return {
                    type: 'literal',
                    value: pathElement.slice(0)
                };
            });

            if (!queryPart) {
                return [pathSpec, {}];
            }

            // create query spec
            const querySpec = queryPart.split('&').reduce((querySpec, queryField) => {
                const [queryName, paramName] = queryField.split('=');
                if (!queryName) {
                    throw new Error('Query name not provided in path spec');
                }
                // destructuring arrays from Array<string> may result in
                // undefined variables; split will always produce a string element for the
                // first position, even if the string being split is empty.
                if (typeof paramName === 'undefined') {
                    throw new Error('Param name not provided in path spec');
                }
                if (paramName.charAt(0) === ':') {
                    if (paramName.charAt(1) === '-') {
                        querySpec[queryName] = {
                            type: 'param',
                            name: paramName.slice(2),
                            optional: true
                        };
                    } else {
                        querySpec[queryName] = {
                            type: 'param',
                            name: paramName.slice(1),
                            optional: false
                        };
                    }
                } else {
                    querySpec[queryName] = {
                        type: 'literal',
                        name: paramName.slice(0),
                        value: paramName
                    };
                }
                return querySpec;
            }, {});

            return [pathSpec, querySpec];
        }

        addRoute(routeSpec, {pluginName, defaults, mode}) {
            if (typeof routeSpec.params === 'undefined') {
                routeSpec.params = {};
            }
            if (!routeSpec.params.plugin) {
                routeSpec.params.plugin = pluginName;
            }

            if (defaults) {
                Object.keys(defaults).forEach((defaultKey) => {
                    if (!routeSpec[defaultKey]) {
                        routeSpec[defaultKey] = defaults[defaultKey];
                    }
                });
            }

            // Handle old view spec.
            if (!routeSpec.view && routeSpec.params && routeSpec.params.view) {
                routeSpec.view = routeSpec.params.view;
            }

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
            const pathConfig = routeSpec.path;
            if (!pathConfig) {
                console.error('Missing path in plugin config', routeSpec);
                throw new Error('Missing path in plugin config.');
            }
            if (typeof pathConfig === 'string') {
                const [path, pathQueryParams] = this.transformPathSpec(pathConfig);
                const route = Object.assign({}, routeSpec);
                switch (mode) {
                case 'auto':
                    // In auto mode, the plugin name becomes the first path component.
                    path.unshift({
                        type: 'literal',
                        value: pluginName
                    });
                }
                route.path = path;
                const queryParams = Object.assign(routeSpec.queryParams || {}, pathQueryParams);
                route.queryParams = queryParams;

                this.routes.push(route);
                return;
            }

            const path = pathConfig.map((pathElement) => {
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

            switch (mode) {
            case 'auto':
                // In auto mode, the plugin name becomes the first path component.
                path.unshift({
                    type: 'literal',
                    value: pluginName
                });
            }

            const route = Object.assign({}, routeSpec);
            route.path = path;

            this.routes.push(route);
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

            const realPath = window.location.pathname.substr(1).split('/');

            return {
                original: hash,
                realPath,
                path,
                query
            };
        }

        matchPath(path, route) {
            // Match the path.
            // Walk through the path, for each path element:
            // - if no more route path elements, and "captureExtraPath" is set,
            //   and the last path element is of type "rest", put the rest of
            //   the request path into the special "rest" parameter.
            // - process parameter based on the type.
            const params = {};
            matchloop: for (let j = 0; j < path.length; j += 1) {
                const routePathElement = route.path[j];
                const requestPathElement = path[j];
                if (!routePathElement) {
                    // end of the route path.
                    if (route.captureExtraPath) {
                        params['rest'] = path.slice(j - 1);
                        break;
                    }
                }

                switch (routePathElement.type) {
                case 'literal':
                    // current path element must match current route element
                    if (routePathElement.value !== requestPathElement) {
                        return;
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
                        return;
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
                            return;
                        }
                    } catch (ex) {
                        console.warn('invalid route with regexp element', ex);
                        return;
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
                        params[name] = path.slice(j).join(routePathElement.joinWith);
                    } else {
                        params[name] = path.slice(j);
                    }

                    break matchloop;
                default:
                    // If the path element is not well formed (not a recognized type)
                    // just skip it with a warning.
                    console.warn('invalid route: type not recognized', routePathElement);
                    return;
                }
            }
            return params;
        }

        processPath(path) {
            let route;
            for (let i = 0; i < this.routes.length; i += 1) {
                route = this.routes[i];

                const isRest = route.path[route.path.length - 1].type === 'rest';
                if (route.path.length > path.length) {
                    // We can only match on a path shorter than the route path if:
                    // - all params after the route path after the end of the current path are optional
                    // - the route has the flag "captureExtraPath"
                    // - the route has a final path element defined as type "rest"
                    const isAllOptional = route.path.slice(path.length).every((routePathElement) => {
                        return routePathElement.optional;
                    });
                    if (!(isAllOptional || route.captureExtraPath || isRest)) {
                        continue;
                    }
                } else if (route.path.length < path.length) {
                    // A longer path may match if either the route can automatically
                    // capture the rest of the path or the last component is of type 'rest'
                    // TODO: use one or the other, not both!
                    if (!(route.captureExtraPath || isRest)) {
                        continue;
                    }
                }

                const params = this.matchPath(path, route);

                if (params) {
                    return {route, params};
                }
            }
            return null;
        }

        processQuery(route, query) {
            // Now process any query parameters.
            // Query params are not used for route selection, but are used
            // to populate the params object.
            // Only query params provided in the route will be extracted and
            // placed into the params.

            const params = {};

            // The total params is the path params and query params
            const searchParamKeys = Object.keys(query);
            const queryParamsSpec = route.route.queryParams || {};

            // Use the query params spec in the route first. This picks up
            // literals, and also enables the strict query param protocol in
            // which only defined query params are recognized.
            // The captureExtraSearch route flag disables the latter behavior.
            // All undefined query params are simply copied to the req.query.
            Object.keys(queryParamsSpec).forEach((key) => {
                const paramSpec = queryParamsSpec[key];
                // This allows for supplying a param
                // from the config.
                // TODO: improve this, and add support for query param specs
                //       e.g. type coercion.
                if (paramSpec === true) {
                    // Simply setting the query param spec to "true" will cause
                    // it to be used, even if it is not provided.
                    params[key] = query[key];
                } else if (paramSpec.literal) {
                    // A query param can also be specified as a
                    // literal value, in which case the value from the spec
                    // is placed into the params.
                    params[key] = paramSpec.literal;
                } else if (typeof query[key] !== 'undefined') {
                    // Defaults to simply using the query value if it is found.
                    params[key] = query[key];
                } else {
                    return;
                }
                delete searchParamKeys[key];
            });
            if (route.route.captureExtraSearch) {
                searchParamKeys.forEach((key) => {
                    params[key] = query[key];
                });
            }

            return params;
        }

        redirect(url) {
            window.location.assign(url);
        }

        findRoute(request) {
            // // No route at all? Return the default route.
            // if (request.path.length === 0 && Object.keys(request.query).length === 0) {
            //     return {
            //         request,
            //         params: {},
            //         route: this.defaultRoute
            //     };
            // }

            if (request.realPath.length > 0 && request.realPath[0] !== '') {
                // If we have a path other than /, we are probably on an errant doc site request.
                throw new NotFoundException({
                    request,
                    params: {},
                    route: null,
                    original: request.original,
                    path: request.path
                });
            } else {
                // If there is also no hash path, and the redirect-to-www feature is enabled,
                // do the redirect.
                if (request.path.length === 0) {
                    if (!this.runtime.service('session').isAuthenticated() &&
                        this.runtime.featureEnabled('redirect-to-www')) {
                        this.runtime.send('ui', 'setTitle', 'Redirecting to Homepage...');
                        this.redirect(`https://${this.urls.marketing}`);
                        return;
                    }
                    return {
                        request,
                        params: {},
                        route: this.defaultRoute
                    };
                } else {
                    // The normal case, just let pass through.
                }
            }

            const foundRoute = this.processPath(request.path);

            if (!foundRoute) {
                throw new NotFoundException({
                    request,
                    params: {},
                    route: null,
                    original: request.original,
                    path: request.path
                });
            }

            const queryParams = this.processQuery(foundRoute, request.query);
            if (queryParams) {
                Object.assign(foundRoute.params, queryParams);
            }

            // Now we handle fixed params; this operate a bit like props. They are specified
            // in the route config, and simply amend the props passed to the widget.
            // This provides a mechanism for the plugin to directly pass params to the route's
            // widget.
            if (foundRoute.route.params) {
                Object.assign(foundRoute.params, foundRoute.route.params);
            }

            foundRoute.request = request;

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
            // Oops, may be provided as "query" property
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
                    if (location.urlPath) {
                        const url = new URL(window.location.toString());
                        url.hash = '#' + finalPath;
                        url.pathname = location.urlPath;
                        window.location.assign(url.toString());
                    } else {

                        const url = new URL(window.location.toString());
                        url.hash = '#' + finalPath;
                        url.pathname = '';
                        window.location.assign(url.toString());
                    }
                }
            }
        }

        navigateTo(location) {
            if (!location) {
                location = this.defaultRoute;
            }
            if (typeof location === 'string') {
                location = {path: location};
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
