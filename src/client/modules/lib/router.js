var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./json"], function (require, exports, json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Router = exports.RedirectException = exports.NotFoundHasRealPathException = exports.NotFoundNoHashException = exports.NotFoundException = void 0;
    var NotFoundException = /** @class */ (function (_super) {
        __extends(NotFoundException, _super);
        // request: any;
        function NotFoundException(_a) {
            var params = _a.params, message = _a.message, request = _a.request;
            var _this = _super.call(this, message) || this;
            // this.original = original;
            // this.path = path;
            _this.params = params;
            _this.request = request;
            _this.name = 'NotFoundException';
            return _this;
        }
        return NotFoundException;
    }(Error));
    exports.NotFoundException = NotFoundException;
    var NotFoundNoHashException = /** @class */ (function (_super) {
        __extends(NotFoundNoHashException, _super);
        function NotFoundNoHashException(_a) {
            var message = _a.message;
            return _super.call(this, message) || this;
        }
        return NotFoundNoHashException;
    }(Error));
    exports.NotFoundNoHashException = NotFoundNoHashException;
    var NotFoundHasRealPathException = /** @class */ (function (_super) {
        __extends(NotFoundHasRealPathException, _super);
        function NotFoundHasRealPathException(_a) {
            var message = _a.message, realPath = _a.realPath;
            var _this = _super.call(this, message) || this;
            _this.realPath = realPath;
            return _this;
        }
        return NotFoundHasRealPathException;
    }(Error));
    exports.NotFoundHasRealPathException = NotFoundHasRealPathException;
    var RedirectException = /** @class */ (function (_super) {
        __extends(RedirectException, _super);
        function RedirectException(_a) {
            var url = _a.url;
            var _this = _super.call(this, 'Redirecting') || this;
            _this.url = url;
            return _this;
        }
        return RedirectException;
    }(Error));
    exports.RedirectException = RedirectException;
    function parseQueryString(s) {
        var fields = s.split(/[?&]/);
        var params = {};
        fields.forEach(function (field) {
            if (field.length > 0) {
                var _a = field.split('='), key = _a[0], value = _a[1];
                if (key.length > 0) {
                    params[decodeURIComponent(key)] = decodeURIComponent(value);
                }
            }
        });
        return params;
    }
    function paramsToQuery(params) {
        return Object.keys(params)
            .map(function (key) {
            return key + '=' + encodeURIComponent(params[key]);
        })
            .join('&');
    }
    function getQuery() {
        var query = window.location.search;
        if (!query || query.length === 1) {
            return {};
        }
        return parseQueryString(query.substr(1));
    }
    /*
     - path: ["dashboard", {type: "rest", name: "path"}]
          view: main
          component: /pluginSupport/Plugin
          authorization: true
          # TODO: get rid of this!!
          params:
            view: main
            plugin: dashboard
    */
    var Router = /** @class */ (function () {
        function Router(config) {
            if (!config.defaultLocation) {
                throw new Error('The defaultLocation must be provided');
            }
            // Routing
            this.routes = [];
            this.defaultLocation = config.defaultLocation;
            this.runtime = config.runtime;
            this.urls = config.urls;
        }
        Router.prototype.transformPathSpec = function (path) {
            // split on query
            var _a = path.split('?'), pathPart = _a[0], queryPart = _a[1];
            // split path
            var pathElements = pathPart.split('/').filter(function (pathElement) {
                if (pathElement.trim().length === 0) {
                    return false;
                }
                return true;
            });
            // create path spec
            var pathSpec = pathElements.map(function (pathElement) {
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
            var querySpec = queryPart.split('&').reduce(function (querySpec, queryField) {
                // comes in two forms:
                // full queryname=:paramname
                // :paramname
                var _a = queryField.split('='), queryName = _a[0], paramName = _a[1];
                if (!queryName) {
                    throw new Error('Query name not provided in path spec');
                }
                if (!paramName) {
                    paramName = queryName;
                }
                // destructuring arrays from Array<string> may result in
                // undefined variables; split will always produce a string element for the
                // first position, even if the string being split is empty.
                if (typeof paramName === 'undefined') {
                    console.error('Param name not provided in path spec', querySpec, queryField);
                    throw new Error('Param name not provided in path spec');
                }
                if (paramName.charAt(0) === ':') {
                    if (paramName.charAt(1) === '-') {
                        var name_1 = paramName.slice(2);
                        queryName = (queryName === paramName) ? name_1 : queryName;
                        querySpec[queryName] = {
                            type: 'param',
                            name: name_1,
                            optional: true
                        };
                    }
                    else {
                        var name_2 = paramName.slice(1);
                        queryName = (queryName === paramName) ? name_2 : queryName;
                        querySpec[queryName] = {
                            type: 'param',
                            name: name_2,
                            optional: false
                        };
                    }
                }
                else {
                    querySpec[queryName] = {
                        type: 'literal',
                        name: paramName.slice(0),
                        value: paramName
                    };
                }
                return querySpec;
            }, {});
            return [pathSpec, querySpec];
        };
        Router.prototype.transformQuerySpec = function (querySpec) {
            return Object.entries(querySpec).reduce(function (queryMap, _a) {
                var key = _a[0], queryItemSpec = _a[1];
                if (typeof queryItemSpec === 'boolean') {
                    queryMap[key] = {
                        name: key,
                        type: 'param',
                        optional: false
                    };
                }
                if (json_1.isJSONObject(queryItemSpec)) {
                    if (Object.keys(queryItemSpec).length === 0) {
                        // same as boolean.
                        queryMap[key] = {
                            name: key,
                            type: 'param',
                            optional: false
                        };
                    }
                    else {
                        if ('literal' in queryItemSpec) {
                            queryMap[key] = {
                                name: key,
                                type: 'param',
                                optional: false
                            };
                        }
                    }
                }
                return queryMap;
            }, {});
        };
        Router.prototype.addRoute = function (routeSpec, _a) {
            var pluginName = _a.pluginName, mode = _a.mode;
            if (typeof routeSpec.params === 'undefined') {
                routeSpec.params = {};
            }
            if (!routeSpec.params.plugin) {
                routeSpec.params.plugin = pluginName;
            }
            // Handle old view spec.
            if (!routeSpec.view && routeSpec.params && routeSpec.params.view) {
                console.warn("[" + pluginName + "]: deprecated: view \"" + routeSpec.params.view + "\" supplied in params");
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
            var pathConfig = (function () {
                var pathConfig = routeSpec.path;
                if (!pathConfig) {
                    console.error('Missing path in plugin config', routeSpec);
                    throw new Error('Missing path in plugin config.');
                }
                // TODO: we need to scrub any data coming from config files
                // to ensure it complies with our expectations.
                if (typeof pathConfig === 'string') {
                    return pathConfig;
                }
                if (Array.isArray(pathConfig)) {
                    return pathConfig.join('/');
                }
                throw new Error('Path is not a string');
            })();
            var _b = this.transformPathSpec(pathConfig), path = _b[0], queryParams = _b[1];
            switch (mode) {
                case 'auto':
                    // In auto mode, the plugin name becomes the first path component.
                    path.unshift({
                        type: 'literal',
                        value: pluginName
                    });
            }
            if (path.length === 0) {
                throw new Error("Route path cannot be empty for \"" + pluginName + "\"");
            }
            if (routeSpec.queryParams) {
                var queryParams_1 = this.transformQuerySpec(routeSpec.queryParams);
                Object.assign(queryParams_1, queryParams_1);
            }
            var route = {
                path: path,
                // pathSpec: routeSpec.path,
                view: routeSpec.view,
                component: routeSpec.component,
                authorization: routeSpec.authorization,
                params: routeSpec.params,
                queryParams: queryParams,
                reentrant: routeSpec.reentrant,
                captureExtraPath: routeSpec.captureExtraPath,
                captureExtraSearch: routeSpec.captureExtraSearch,
                rolesRequired: routeSpec.rolesRequired,
                forceMount: routeSpec.forceMount,
                pluginName: routeSpec.pluginName
            };
            this.routes.push(route);
        };
        /*
            getCurrentRequest()
            Gets the current routing request from the browser url.
    
        */
        Router.prototype.getCurrentRequest = function () {
            // We also prohibit a real path.
            var realPath = window.location.pathname.substr(1);
            if (realPath.length > 0) {
                console.error('Have path, cannot route', realPath);
                throw new NotFoundHasRealPathException({
                    message: 'Have path - cannot route',
                    realPath: realPath
                });
            }
            // The path is (for now) from the hash component.
            var hash = (function () {
                if (!window.location.hash || window.location.hash.length === 1) {
                    // throw new NotFoundNoHashException({
                    //     message: 'No hash - cannot route'
                    // });
                    // TODO: make configurable
                    return 'dashboard';
                }
                return window.location.hash.substr(1);
            })();
            // Also get the query the normal way ...
            var query = getQuery();
            // We can also get a query from the hash
            // like https://ci.kbase.us#plugin?a=b
            var pathQuery = hash.split('?', 2);
            if (pathQuery.length === 2) {
                var query2_1 = parseQueryString(pathQuery[1]);
                Object.keys(query2_1).forEach(function (key) {
                    query[key] = query2_1[key];
                });
            }
            var path = pathQuery[0]
                .split('/')
                .filter(function (pathComponent) {
                return pathComponent.length > 0;
            })
                .map(function (pathComponent) {
                return decodeURIComponent(pathComponent);
            });
            return {
                realPath: realPath,
                path: path,
                query: query
            };
        };
        /*
            matchPath - Match the path.
            Walk through the path, for each path element:
            - if no more route path elements, and "captureExtraPath" is set,
              and the last path element is of type "rest", put the rest of
              the request path into the special "rest" parameter.
            - process parameter based on the type.
        */
        Router.prototype.matchPath = function (path, route) {
            var paramsMatch = {};
            var _loop_1 = function (j) {
                var routePathElement = route.path[j];
                var requestPathElement = path[j];
                if (!routePathElement) {
                    // end of the route path.
                    if (route.captureExtraPath) {
                        if (paramsMatch.rest) {
                            console.warn('A rest parameter was already captured, ignoring captureExtraPath');
                        }
                        paramsMatch['rest'] = {
                            name: 'rest',
                            type: 'rest',
                            value: path.slice(j - 1)
                        };
                        return "break";
                    }
                }
                switch (routePathElement.type) {
                    case 'literal':
                        // current path element must match current route element
                        if (routePathElement.value !== requestPathElement) {
                            return { value: false };
                        }
                        break;
                    case 'options':
                        // current path element must match at least one of the
                        // route elements in the "value" property (array).
                        if (!routePathElement.value.some(function (option) {
                            if (requestPathElement === option) {
                                return true;
                            }
                        })) {
                            return { value: false };
                        }
                        break;
                    case 'param':
                        // current path element is not compared, it is considered
                        // a positive match, and is stored in the params  map
                        // under the name of the route elements 'name' property.
                        paramsMatch[routePathElement.name] = {
                            type: 'string',
                            name: routePathElement.name,
                            value: requestPathElement
                        };
                        break;
                    case 'regexp':
                        // current path element is matched against a regular expression
                        // defined by the current route element.
                        try {
                            var regexp = new RegExp(routePathElement.regexp);
                            if (!regexp.test(requestPathElement)) {
                                return { value: false };
                            }
                        }
                        catch (ex) {
                            console.warn('invalid route with regexp element', ex);
                            return { value: false };
                        }
                        break;
                    case 'rest':
                        // unconditionally matches the rest of the request path, storing it
                        // as an array in a parameter named  by the 'name' property, or
                        // if this is missing or falsy, 'rest'.
                        var name_3 = routePathElement.name || 'rest';
                        if (j < route.path.length - 1) {
                            console.warn('rest parameter used before final route element');
                            console.warn('  being treated as regular param');
                            paramsMatch[name_3] = {
                                type: 'string',
                                name: name_3,
                                value: requestPathElement
                            };
                            return "continue";
                        }
                        if (routePathElement.joinWith) {
                            paramsMatch[name_3] = {
                                type: 'string',
                                name: name_3,
                                value: path.slice(j).join(routePathElement.joinWith)
                            };
                        }
                        else {
                            paramsMatch[name_3] = {
                                type: 'rest',
                                name: name_3,
                                value: path.slice(j)
                            };
                        }
                        return "break-matchloop";
                    default:
                        // If the path element is not well formed (not a recognized type)
                        // just skip it with a warning.
                        console.warn('invalid route: type not recognized', routePathElement);
                        return { value: false };
                }
            };
            matchloop: for (var j = 0; j < path.length; j += 1) {
                var state_1 = _loop_1(j);
                if (typeof state_1 === "object")
                    return state_1.value;
                if (state_1 === "break")
                    break;
                switch (state_1) {
                    case "break-matchloop": break matchloop;
                }
            }
            return paramsMatch;
        };
        Router.prototype.processPath = function (path) {
            var route;
            for (var i = 0; i < this.routes.length; i += 1) {
                route = this.routes[i];
                var isRest = route.path[route.path.length - 1].type === 'rest';
                if (route.path.length > path.length) {
                    // We can only match on a path shorter than the route path if:
                    // - all params after the route path after the end of the current path are optional
                    // - the route has the flag "captureExtraPath"
                    // - the route has a final path element defined as type "rest"
                    var isAllOptional = route.path.slice(path.length)
                        .every(function (routePathElement) {
                        return 'optional' in routePathElement && routePathElement.optional;
                    });
                    if (!(isAllOptional || route.captureExtraPath || isRest)) {
                        continue;
                    }
                }
                else if (route.path.length < path.length) {
                    // A longer path may match if either the route can automatically
                    // capture the rest of the path or the last component is of type 'rest'
                    // TODO: use one or the other, not both!
                    if (!(route.captureExtraPath || isRest)) {
                        continue;
                    }
                }
                var params = this.matchPath(path, route);
                if (params) {
                    return { route: route, params: params };
                }
            }
            return null;
        };
        Router.prototype.processQuery = function (route, query) {
            // Now process any query parameters.
            // Query params are not used for route selection, but are used
            // to populate the params object.
            // Only query params provided in the route will be extracted and
            // placed into the params.
            // The total params is the path params and query params
            var searchParamKeys = Object.keys(query);
            var queryParamsSpec = route.queryParams || {};
            // Use the query params spec in the route first. This picks up
            // literals, and also enables the strict query param protocol in
            // which only defined query params are recognized.
            // The captureExtraSearch route flag disables the latter behavior.
            // All undefined query params are simply copied to the req.query.
            var params = {};
            var unusedSearchKeys = [];
            Object.entries(query)
                .forEach(function (_a) {
                var key = _a[0], value = _a[1];
                var spec = queryParamsSpec[key];
                if (!spec) {
                    unusedSearchKeys.push(key);
                }
                // This allows for supplying a param
                // from the config.
                // TODO: improve this, and add support for query param specs
                //       e.g. type coercion.
                if (spec.type === 'param') {
                    // The normal case, in which a search query parameter is
                    // picked up as a "param".
                    params[key] = query[key];
                }
                else if (spec.type === 'literal') {
                    // A query param can also be specified as a
                    // literal value, in which case the value from the spec
                    // is placed into the params.
                    params[key] = spec.value;
                }
            });
            if (route.captureExtraSearch && unusedSearchKeys.length > 0) {
                unusedSearchKeys.forEach(function (key) {
                    params[key] = query[key];
                });
            }
            return params;
        };
        Router.prototype.redirect = function (url) {
            window.location.assign(url);
        };
        Router.prototype.findCurrentRoute = function () {
            var req = this.getCurrentRequest();
            return this.findRoute(req);
        };
        Router.prototype.findRoute = function (request) {
            var _this = this;
            // If there is also no hash path, and the redirect-to-www feature is enabled,
            // do the redirect.
            if (request.path.length === 0) {
                if (!this.runtime.service('session').isAuthenticated() &&
                    this.runtime.featureEnabled('redirect-to-www')) {
                    this.runtime.send('ui', 'setTitle', 'Redirecting to Homepage...');
                    throw new RedirectException({
                        url: "https://" + this.urls.marketing
                    });
                }
            }
            var _a = (function () {
                var result = _this.processPath(request.path);
                if (result !== null) {
                    return result;
                }
                throw new NotFoundException({
                    params: {},
                    // original: request.original,
                    request: request,
                    message: 'Path not found'
                });
            })(), route = _a.route, params = _a.params;
            var queryParams = this.processQuery(route, request.query);
            if (queryParams) {
                Object.assign(params, queryParams);
            }
            // TODO: get rid of these???
            // Now we handle fixed params; this operate a bit like props. They are specified
            // in the route config, and simply amend the props passed to the widget.
            // This provides a mechanism for the plugin to directly pass params to the route's
            // widget.
            if (route.params) {
                Object.assign(route.params, route.params);
            }
            return {
                route: route, request: request, params: params
            };
        };
        Router.prototype.listRoutes = function () {
            return this.routes.map(function (route) {
                return route.path;
            });
        };
        // navigateToPath(location: Location) {
        //     let providedPath, queryString, finalPath;
        //     if (typeof location.path === 'string') {
        //         providedPath = location.path.split('/');
        //     } else if (typeof location.path === 'object' && typeof location.path.push === 'function') {
        //         providedPath = location.path;
        //     } else {
        //         console.error(
        //             'Invalid path in location',
        //             typeof location.path,
        //             location.path instanceof Array,
        //             JSON.parse(JSON.stringify(location))
        //         );
        //         throw new Error('Invalid path in location');
        //     }
        //     // we eliminate empty path components, like extra slashes, or an initial slash.
        //     const normalizedPath = providedPath
        //         .filter((element) => {
        //             if (!element || typeof element !== 'string') {
        //                 return false;
        //             }
        //             return true;
        //         })
        //         .join('/');
        //     if (location.params) {
        //         queryString = paramsToQuery(location.params);
        //     }
        //     // Oops, may be provided as "query" property
        //     if (location.query) {
        //         queryString = paramsToQuery(location.query);
        //     }
        //     if (queryString) {
        //         finalPath = normalizedPath + '?' + queryString;
        //     } else {
        //         finalPath = normalizedPath;
        //     }
        //     if (location.external) {
        //         finalPath = '/' + finalPath;
        //         if (location.replace) {
        //             this.replacePath(finalPath);
        //         } else {
        //             // We need to blow away the whole thing, since there will
        //             // be a hash there.
        //             window.location.href = finalPath;
        //         }
        //     } else {
        //         if (location.replace) {
        //             this.replacePath('#' + finalPath);
        //         } else {
        //             if (location.urlPath) {
        //                 const url = new URL(window.location.toString());
        //                 url.hash = '#' + finalPath;
        //                 url.pathname = location.urlPath;
        //                 window.location.assign(url.toString());
        //             } else {
        //                 const url = new URL(window.location.toString());
        //                 url.hash = '#' + finalPath;
        //                 url.pathname = '';
        //                 window.location.assign(url.toString());
        //             }
        //         }
        //     }
        // }
        Router.prototype.navigateTo = function (location) {
            // if (!location) {
            //     location = this.defaultRoute;
            // }
            // if (typeof location === 'string') {
            //     location = { path: location };
            // }
            switch (location.type) {
                case 'internal':
                    this.navigateInternal(location.path);
                    break;
                case 'external':
                    this.navigateExternal(location.url, true);
            }
            // if (location.path !== undefined) {
            //     this.navigateToPath(location);
            // } else if (typeof location.redirect === 'string') {
            //     this.redirectTo(location.redirect);
            // } else {
            //     throw new Error('Invalid navigation location -- no path');
            // }
        };
        Router.prototype.navigateInternal = function (path) {
            var url = new URL(window.location.toString());
            url.hash = '#' + path;
            url.pathname = '';
            window.location.assign(url.toString());
        };
        Router.prototype.replacePath = function (location) {
            window.location.replace(location);
        };
        Router.prototype.navigateExternal = function (location, newWindow) {
            if (newWindow) {
                window.open(location);
            }
            else {
                window.location.replace(location);
            }
        };
        return Router;
    }());
    exports.Router = Router;
});
