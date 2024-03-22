import { Role } from "@kbase/ui-lib/lib/Auth";
import { ReactNode } from "react";
import { RouteProps } from "../components/Router2";
import { HashPath } from "../contexts/RouterContext";

export enum RouteSpecElementType {
    REGEXP = "REGEXP",
    PARAM = "PARAM",
    SOME_OR_NONE = "SOME_OR_NONE",
    SOME = "SOME"
}

export interface RouteSpecElementBase {
    type: RouteSpecElementType;
}

export interface RouteSpecElementLiteral extends RouteSpecElementBase {
    type: RouteSpecElementType.REGEXP;
    regexp: RegExp;
}

export interface RouteSpecElementSomeOrNone extends RouteSpecElementBase {
    type: RouteSpecElementType.SOME_OR_NONE;
}

export interface RouteSpecElementSome extends RouteSpecElementBase {
    type: RouteSpecElementType.SOME;
}

export interface RouteSpecElementParam extends RouteSpecElementBase {
    type: RouteSpecElementType.PARAM;
    name: string;
    required: boolean;
}

export type RouteSpecElement =
    | RouteSpecElementLiteral
    | RouteSpecElementParam
    | RouteSpecElementSomeOrNone
    | RouteSpecElementSome;

export type RouteSpec = Array<RouteSpecElement>;

export type RouteRenderer = (props: RouteProps) => ReactNode;

export type Params = Map<string, string>;

export interface RouteOptions {
    authenticationRequired?: boolean;
    rolesRequired?: Array<Role>;
    label?: string;
}

export interface SimpleRouteSpec {
    path: string,
    auth: boolean,
}

export interface SimplePluginRouteSpec extends SimpleRouteSpec {
    view: string
}

export interface MatchedHashPath {
    hashPath: string;  // The hash path with any matched params removed, and attached search removed
    params: Params;    // The combined params - hash path matched params, hash search, url search
}

export class Route {
    rawRouteSpec: string;
    label?: string;
    routeSpec: RouteSpec;
    render: RouteRenderer;
    routeOptions: RouteOptions;
    constructor(rawRouteSpec: string, routeOptions: RouteOptions, render: RouteRenderer) {
        this.rawRouteSpec = rawRouteSpec;
        this.label = routeOptions.label;
        this.render = render;
        this.routeOptions = routeOptions;
        this.routeSpec = this.parseRouteSpec();
    }

    parseRouteSpec(): RouteSpec {
        const normalized = this.rawRouteSpec.split("/")
            .filter((element) => {
                return element.length > 0;
            });

        const routeSpec: RouteSpec = [];

        for (const element of normalized) {
            if (element === "*") {
                // The wildcard can only be used as the last element --
                // it means we match any # of path elements, including none.
                // The handler is expected to utilize the variable number of
                // path elements.
                routeSpec.push({
                    type: RouteSpecElementType.SOME_OR_NONE,
                });
                // TODO: could set up to throw if there are more
                // elements;
                break;
            } else if (element === "+") {
                // The wildcard can only be used as the last element --
                // it means we match any # of path elements, including none.
                // The handler is expected to utilize the variable number of
                // path elements.
                routeSpec.push({
                    type: RouteSpecElementType.SOME,
                });
                // TODO: could set up to throw if there are more
                // elements;
                break;
            }
            if (element.charAt(0) === ":") {
                if (element.charAt(element.length - 1) === "?") {
                    routeSpec.push({
                        type: RouteSpecElementType.PARAM,
                        name: element.slice(1, -1),
                        required: false,
                    });
                } else {
                    routeSpec.push({
                        type: RouteSpecElementType.PARAM,
                        name: element.slice(1),
                        required: true,
                    });
                }
            } else if (/[a-zA-Z0-9]+/.test(element)) {
                // just alphas and numbers, treat as literal.
                routeSpec.push({
                    type: RouteSpecElementType.REGEXP,
                    regexp: new RegExp(`^${element}$`, "i"),
                });

            } else {
                routeSpec.push({
                    type: RouteSpecElementType.REGEXP,
                    regexp: new RegExp(element, "i"),
                });
            }
        }

        return routeSpec;
    }

    matchHashPath({ hash, params }: HashPath): MatchedHashPath | null {

        // First match the param literals.

        // TODO: optional

        /*
                We walk the hash path and the route path in tandem, matching
                any literal route path element with the corresponding hash path element,
                and preserving the value of any hash path element which
                is configured as a param.
                If all goes well,
            */
        const literalPathElements: Array<string> = [];
        const hashParams: Map<string, string> = new Map();

        const hashAsPath = hash.split('/')
            // special handling here - only real use case is an empty string, as other
            // code ensures that there are no empty elements.
            .filter((element: string) => {
                return element.length > 0;
            })

        for (const [index, routeElement] of this.routeSpec.entries()) {
            const pathElement = hashAsPath[index];
            switch (routeElement.type) {
                case RouteSpecElementType.REGEXP:
                    // Early exit if there are no more elements but more route.
                    if (typeof pathElement === "undefined") {
                        return null;
                    }
                    if (!routeElement.regexp.test(pathElement)) {
                        return null;
                    }
                    literalPathElements.push(pathElement);
                    break;
                case RouteSpecElementType.PARAM:
                    if (typeof pathElement === "undefined") {
                        if (routeElement.required) {
                            return null;
                        } else {
                            continue;
                        }
                    } else {
                        hashParams.set(routeElement.name, pathElement);
                    }
                    break;
                case RouteSpecElementType.SOME:

                    if (typeof pathElement === 'undefined') {
                        return null;
                    }
                    for (const pathElement of hashAsPath.slice(index)) {
                        literalPathElements.push(pathElement);
                    }
                    break;
                case RouteSpecElementType.SOME_OR_NONE:
                    // To honor the "none", we consider it a match if 
                    // there are no more actual path elements.

                    // We have run out of path without a match, so we
                    // can say this is not a match!


                    for (const pathElement of hashAsPath.slice(index)) {
                        literalPathElements.push(pathElement);
                    }
            }
        }

        /*
            If we get to the end, and there are more hash path elements not covered by the
            route, consider this a failure to match.
        */
       
        if (literalPathElements.length + hashParams.size !== hashAsPath.length) {
            return null;
        }

        // NOTE: for now we ignore the search params; we used to enforce hash params
        // (basically whitelisting them), but this seemed more trouble than worth.
        // And filtering on search params also seems like an invitation to confusion.

        // Finally, since we have a match, copy the params from the query, which
        // includes both the real url search and the fake hash search.
        // hashPath.query.forEach((value, key) => {
        //     params.set(key, value);
        // });
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                hashParams.set(key, value);
            }
        }

        // return params;
        return {
            hashPath: literalPathElements.join('/'),
            params: hashParams
        }
    }
}
