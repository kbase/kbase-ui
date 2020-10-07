
import { isJSONObject, JSONObject } from "./kb_lib/json";
import { SimpleMap } from "./types";

export class CustomError {
    message: string;
    name: string;
    constructor(message: string) {
        this.message = message;
        this.name = 'CustomError';
    }
}

export interface NotFoundExceptionParams {
    // original: string;
    // path: Array<string>;
    params: SimpleMap<string>;
    // request: RoutingRequest;
    message: string;
    request: RoutingRequest;
}

export class NotFoundException extends CustomError {
    // original: string;
    // path: Array<string>;
    params: any;
    request: RoutingRequest;
    // request: any;
    constructor({ params, message, request }: NotFoundExceptionParams) {
        super(message);
        // this.original = original;
        // this.path = path;
        this.params = params;
        this.request = request;
        this.name = 'NotFoundException';
    }
}

export class NotFoundNoHashException extends CustomError {
    constructor({ message }: { message: string; }) {
        super(message);
    }
}

export class NotFoundHasRealPathException extends CustomError {
    realPath: Array<string>;
    constructor({ message, realPath }: { message: string, realPath: Array<string>; }) {
        super(message);
        this.realPath = realPath;
    }
}

export class RedirectException extends CustomError {
    url: string;
    constructor({ url }: { url: string; }) {
        super('Redirecting');
        this.url = url;
    }
}


function parseQueryString(s: string) {
    const fields = s.split(/[?&]/);
    const params: SimpleMap<string> = {};
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

function paramsToQuery(params: SimpleMap<string>) {
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

interface RouterParams {
    defaultLocation: RoutingLocation;
    runtime: any;
    urls: SimpleMap<string>;
}

interface QueryItemBase {
    type: string;
    name: string;
}

interface QueryItemLiteral extends QueryItemBase {
    type: 'literal',
    value: string;
}

interface QueryItemParam extends QueryItemBase {
    type: 'param',
    optional?: boolean;
}

type QueryItem = QueryItemLiteral | QueryItemParam;

type Params = SimpleMap<string>;

// type PathSpecString = string;
// type PathSpecObject = {
//     type: string; 
//     name?: string;
//     queryParams?: SimpleMap<string>; // not really
//     reentrant?: boolean;
// }
// queryParams:
//           tab: {}
//         authorization: true
//         reentrant: false

interface PathElementBase {
    type: string;
}

interface PathElementLiteral extends PathElementBase {
    type: 'literal';
    value: string;
}

interface PathElementRegexp extends PathElementBase {
    type: 'regexp';
    regexp: string;
}

interface PathElementOptions extends PathElementBase {
    type: 'options';
    value: Array<string>;
}

interface PathElementParam extends PathElementBase {
    type: 'param';
    name: string;
    optional: boolean;
}

interface PathElementRest extends PathElementBase {
    type: 'rest';
    name: string;
    optional: boolean;
    joinWith: string;
}

type PathElement = PathElementLiteral | PathElementParam | PathElementRest | PathElementOptions | PathElementRegexp;

// TODO: all incoming stuff should be or extend JSON.
// TODO: maybe make this just a JSONObject??
interface QueryItemObjectLiteralSpec extends JSONObject {
    literal: string;
}

interface QueryItemObjectSpec extends JSONObject {
}

type QueryItemSpec =
    boolean | QueryItemObjectSpec | QueryItemObjectLiteralSpec;


export interface RouteSpec {
    path: string | Array<string>;
    view: string;
    component: string;
    pluginName?: string; // TODO: make this a discriminated type: plugin, component
    queryParams?: SimpleMap<QueryItemSpec>; // not really
    authorization?: boolean;
    params?: Params;
    reentrant?: boolean;
    captureExtraPath?: boolean;
    captureExtraSearch?: boolean;
    rolesRequired?: Array<string>;
    forceMount?: boolean;
}

export interface RouteOptions {
    pluginName: string;
    mode: string;
}

interface RequestParamBase {
    type: string;
    name: string;
}

interface RequestParamString extends RequestParamBase {
    type: 'string',
    value: string;
}

interface RequestParamRest extends RequestParamBase {
    type: 'rest',
    value: Array<string>;
}

type RequestParam = RequestParamString | RequestParamRest;

// interface RequestParams {
//     rest?: Array<string>;
//     params: SimpleMap<RequestParam>;
// }

type RequestParams = SimpleMap<RequestParam>;

export interface Route {
    // request: RoutingRequest;
    // pathSpec: string;
    path: Array<PathElement>;
    view: string;
    component: string;

    // optional
    queryParams?: SimpleMap<QueryItem>; // not really
    authorization?: boolean;
    params?: Params;
    reentrant?: boolean;
    captureExtraPath?: boolean;
    captureExtraSearch?: boolean;
    rolesRequired?: Array<string>;
    forceMount?: boolean;
    pluginName?: string;
}

export interface RoutedRequest {
    route: Route;
    request: RoutingRequest;
    params: RequestParams;
}


// interface Routed {
//     request: RoutingRequest;
//     // pathSpec: string;
//     // path: Array<PathElement>;
//     view: string;
//     // queryParams?: SimpleMap<string>; // not really
//     authorization?: boolean;
//     params?: Params;
//     reentrant?: boolean;
//     captureExtraPath?: boolean;
// }

type Mode = 'auto';

interface RoutingRequest {
    realPath: Array<string>;
    path: Array<string>;
    original: string;
    query: SimpleMap<string>;
}

// interface Location {
//     path: string | Array<string>;
//     // TODO use only one of params or query
//     params?: SimpleMap<string>;
//     query?: SimpleMap<string>;
//     external?: boolean;
//     replace?: boolean;
//     urlPath?: string;
//     redirect?: boolean;
//     newWindow?: boolean;
// }

interface RoutingLocationBase {
    type: string;
    newWindow?: boolean;
    params?: Params;
}

interface InternalRoutingLocation extends RoutingLocationBase {
    type: 'internal',
    path: string;
}

interface ExternalRoutingLocation extends RoutingLocationBase {
    type: 'external',
    url: string;
}

export type RoutingLocation = InternalRoutingLocation | ExternalRoutingLocation;


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
export class Router {
    routes: Array<Route>;
    defaultLocation: RoutingLocation;
    runtime: any;
    urls: SimpleMap<string>;
    constructor(config: RouterParams) {
        if (!config.defaultLocation) {
            throw new Error('The defaultLocation must be provided');
        }
        // Routing
        this.routes = [];
        this.defaultLocation = config.defaultLocation;
        this.runtime = config.runtime;
        this.urls = config.urls;
    }

    transformPathSpec(path: string): [Array<PathElement>, SimpleMap<QueryItem>] {
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
        const pathSpec = pathElements.map<PathElement>((pathElement) => {
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
        const querySpec = queryPart.split('&').reduce<SimpleMap<QueryItem>>((querySpec, queryField) => {
            // comes in two forms:
            // full queryname=:paramname
            // :paramname
            let [queryName, paramName] = queryField.split('=');
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
                    const name = paramName.slice(2);
                    queryName = (queryName === paramName) ? name : queryName;
                    querySpec[queryName] = {
                        type: 'param',
                        name,
                        optional: true
                    };
                } else {
                    const name = paramName.slice(1);
                    queryName = (queryName === paramName) ? name : queryName;
                    querySpec[queryName] = {
                        type: 'param',
                        name,
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

    transformQuerySpec(querySpec: SimpleMap<QueryItemSpec>): SimpleMap<QueryItem> {
        return Object.entries(querySpec).reduce<SimpleMap<QueryItem>>((queryMap, [key, queryItemSpec]) => {
            if (typeof queryItemSpec === 'boolean') {
                queryMap[key] = {
                    name: key,
                    type: 'param',
                    optional: false
                };
            }
            if (isJSONObject(queryItemSpec)) {
                if (Object.keys(queryItemSpec).length === 0) {
                    // same as boolean.
                    queryMap[key] = {
                        name: key,
                        type: 'param',
                        optional: false
                    };
                } else {
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
    }

    addRoute(routeSpec: RouteSpec, { pluginName, mode }: RouteOptions) {
        if (typeof routeSpec.params === 'undefined') {
            routeSpec.params = {};
        }
        if (!routeSpec.params.plugin) {
            routeSpec.params.plugin = pluginName;
        }

        // Handle old view spec.
        if (!routeSpec.view && routeSpec.params && routeSpec.params.view) {
            console.warn(`[${pluginName}]: deprecated: view "${routeSpec.params.view}" supplied in params`);
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
        const pathConfig = (() => {
            const pathConfig = routeSpec.path;
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

        const [path, queryParams] = this.transformPathSpec(pathConfig);
        switch (mode) {
            case 'auto':
                // In auto mode, the plugin name becomes the first path component.
                path.unshift({
                    type: 'literal',
                    value: pluginName
                });
        }

        if (path.length === 0) {
            throw new Error(`Route path cannot be empty for "${pluginName}"`);
        }

        if (routeSpec.queryParams) {
            const queryParams2 = this.transformQuerySpec(routeSpec.queryParams);
            Object.assign(queryParams, queryParams2);
        }

        const route: Route = {
            path,
            // pathSpec: routeSpec.path,
            view: routeSpec.view,
            component: routeSpec.component,
            authorization: routeSpec.authorization,
            params: routeSpec.params,
            queryParams,
            reentrant: routeSpec.reentrant,
            captureExtraPath: routeSpec.captureExtraPath,
            captureExtraSearch: routeSpec.captureExtraSearch,
            rolesRequired: routeSpec.rolesRequired,
            forceMount: routeSpec.forceMount,
            pluginName: routeSpec.pluginName
        };
        this.routes.push(route);
    }

    /*
        getCurrentRequest()
        Gets the current routing request from the browser url.

    */
    getCurrentRequest(): RoutingRequest {
        // We also prohibit a real path.
        const realPath = window.location.pathname.substr(1)
            .split('/')
            .filter((pathElement) => {
                return (pathElement.length > 0);
            });

        if (realPath.length > 0) {
            console.error('Have path, cannot route', realPath);
            throw new NotFoundHasRealPathException({
                message: 'Have path - cannot route',
                realPath
            });
        }

        // The path is (for now) from the hash component.
        const hash = (() => {
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
        const query = getQuery();

        // We can also get a query from the hash
        // like https://ci.kbase.us#plugin?a=b
        const [hashPath, hashQuery] = hash.split('?', 2);
        if (hashQuery) {
            const query2 = parseQueryString(hashQuery);
            Object.keys(query2).forEach((key) => {
                query[key] = query2[key];
            });
        }
        const path = hashPath
            .split('/')
            .filter((pathComponent) => {
                return pathComponent.length > 0;
            })
            .map((pathComponent) => {
                return decodeURIComponent(pathComponent);
            });

        return {
            realPath,
            path,
            original: hashPath,
            query
        };
    }

    /*
        matchPath - Match the path.
        Walk through the path, for each path element:
        - if no more route path elements, and "captureExtraPath" is set,
          and the last path element is of type "rest", put the rest of
          the request path into the special "rest" parameter.
        - process parameter based on the type.
    */
    matchPath(path: Array<string>, route: Route): RequestParams | false {
        const paramsMatch: RequestParams = {};
        matchloop: for (let j = 0; j < path.length; j += 1) {
            const routePathElement = route.path[j];
            const requestPathElement = path[j];
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
                    break;
                }
            }

            switch (routePathElement.type) {
                case 'literal':
                    // current path element must match current route element
                    if (routePathElement.value !== requestPathElement) {
                        return false;
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
                        return false;
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
                        const regexp = new RegExp(routePathElement.regexp);
                        if (!regexp.test(requestPathElement)) {
                            return false;
                        }
                    } catch (ex) {
                        console.warn('invalid route with regexp element', ex);
                        return false;
                    }
                    break;
                case 'rest':
                    // unconditionally matches the rest of the request path, storing it
                    // as an array in a parameter named  by the 'name' property, or
                    // if this is missing or falsy, 'rest'.
                    let name = routePathElement.name || 'rest';
                    if (j < route.path.length - 1) {
                        console.warn('rest parameter used before final route element');
                        console.warn('  being treated as regular param');
                        paramsMatch[name] = {
                            type: 'string',
                            name,
                            value: requestPathElement
                        };
                        continue;
                    }

                    if (routePathElement.joinWith) {
                        paramsMatch[name] = {
                            type: 'string',
                            name,
                            value: path.slice(j).join(routePathElement.joinWith)
                        };
                    } else {
                        paramsMatch[name] = {
                            type: 'rest',
                            name,
                            value: path.slice(j)
                        };
                    }

                    break matchloop;
                default:
                    // If the path element is not well formed (not a recognized type)
                    // just skip it with a warning.
                    console.warn('invalid route: type not recognized', routePathElement);
                    return false;
            }
        }
        return paramsMatch;
    }

    processPath(path: Array<string>): { route: Route, params: RequestParams; } | null {
        let route;

        for (let i = 0; i < this.routes.length; i += 1) {
            route = this.routes[i];
            const isRest = route.path[route.path.length - 1].type === 'rest';
            if (route.path.length > path.length) {
                // We can only match on a path shorter than the route path if:
                // - all params after the route path after the end of the current path are optional
                // - the route has the flag "captureExtraPath"
                // - the route has a final path element defined as type "rest"
                const isAllOptional = route.path.slice(path.length)
                    .every((routePathElement) => {
                        return 'optional' in routePathElement && routePathElement.optional;
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
                return { route, params };
            }
        }
        return null;
    }

    processQuery(route: Route, query: SimpleMap<string>): RequestParams {
        // Now process any query parameters.
        // Query params are not used for route selection, but are used
        // to populate the params object.
        // Only query params provided in the route will be extracted and
        // placed into the params.

        // The total params is the path params and query params
        const searchParamKeys = Object.keys(query);
        const queryParamsSpec = route.queryParams || {};

        // Use the query params spec in the route first. This picks up
        // literals, and also enables the strict query param protocol in
        // which only defined query params are recognized.
        // The captureExtraSearch route flag disables the latter behavior.
        // All undefined query params are simply copied to the req.query.
        const params: RequestParams = {};
        const unusedSearchKeys: Array<string> = [];
        Object.entries(query)
            .forEach(([key, value]) => {
                const spec = queryParamsSpec[key];
                if (!spec) {
                    unusedSearchKeys.push(key);
                    return;
                }
                // This allows for supplying a param
                // from the config.
                // TODO: improve this, and add support for query param specs
                //       e.g. type coercion.
                if (spec.type === 'param') {
                    // The normal case, in which a search query parameter is
                    // picked up as a "param".
                    params[key] = {
                        name: key,
                        type: 'string',
                        value: query[key]
                    };
                } else if (spec.type === 'literal') {
                    // A query param can also be specified as a
                    // literal value, in which case the value from the spec
                    // is placed into the params.
                    params[key] = {
                        name: key,
                        type: 'string',
                        value: spec.value
                    };
                }
            });

        if (route.captureExtraSearch && unusedSearchKeys.length > 0) {
            unusedSearchKeys.forEach((key) => {
                params[key] = {
                    name: key,
                    type: 'string',
                    value: query[key]
                };
            });
        }

        return params;
    }

    redirect(url: string) {
        window.location.assign(url);
    }

    findCurrentRoute() {
        const req = this.getCurrentRequest();
        return this.findRoute(req);
    }

    findRoute(request: RoutingRequest): RoutedRequest {
        // If there is also no hash path, and the redirect-to-www feature is enabled,
        // do the redirect.
        if (request.path.length === 0) {
            if (!this.runtime.service('session').isAuthenticated() &&
                this.runtime.featureEnabled('redirect-to-www')) {
                this.runtime.send('ui', 'setTitle', 'Redirecting to Homepage...');
                throw new RedirectException({
                    url: `https://${this.urls.marketing}`
                });
            }
        }

        const { route, params } = (() => {
            const result = this.processPath(request.path);
            if (result !== null) {
                return result;
            }
            throw new NotFoundException({
                params: {},
                // original: request.original,
                request,
                message: 'Path not found'
            });
        })();

        const queryParams = this.processQuery(route, request.query);
        if (queryParams) {
            Object.assign(params, queryParams);
        }

        // TODO: get rid of these???
        // Now we handle fixed params; this operate a bit like props. They are specified
        // in the route config, and simply amend the props passed to the widget.
        // This provides a mechanism for the plugin to directly pass params to the route's
        // widget.
        if (route.params) {
            Object.entries(route.params).forEach(([key, value]) => {
                // Object.assign(params, route.params);
                params[key] = {
                    name: key,
                    type: 'string',
                    value
                };
            });

        }

        return {
            route, request, params
        };
    }

    listRoutes() {
        return this.routes.map((route) => {
            return route.path;
        });
    }

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

    navigateTo(location: RoutingLocation) {
        // if (!location) {
        //     location = this.defaultRoute;
        // }
        // if (typeof location === 'string') {
        //     location = { path: location };
        // }
        switch (location.type) {
            case 'internal':
                this.navigateInternal(location);
                break;
            case 'external':
                this.navigateExternal(location, location.newWindow || false);
        }

        // if (location.path !== undefined) {
        //     this.navigateToPath(location);
        // } else if (typeof location.redirect === 'string') {
        //     this.redirectTo(location.redirect);
        // } else {
        //     throw new Error('Invalid navigation location -- no path');
        // }
    }

    navigateInternal(location: InternalRoutingLocation) {
        const url = new URL(window.location.toString());
        url.hash = '#' + location.path;
        url.pathname = '';
        if (typeof location.params !== 'undefined') {
            const params = url.searchParams;
            Object.entries(location.params).forEach(([key, value]) => {
                params.set(key, value);
            });
        }
        window.location.assign(url.toString());
    }

    replacePath(location: string) {
        window.location.replace(location);
    }

    navigateExternal(location: ExternalRoutingLocation, newWindow: boolean) {
        const url = new URL(location.url);
        if (typeof location.params !== 'undefined') {
            const params = url.searchParams;
            Object.entries(location.params).forEach(([key, value]) => {
                params.set(key, value);
            });
        }
        if (newWindow) {
            window.open(url.toString());
        } else {
            window.location.replace(url.toString());
        }
    }
}
