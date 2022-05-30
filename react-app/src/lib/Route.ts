import { RouteProps } from "../components/Router2";
import { HashPath } from "../contexts/RouterContext";

export enum RouteSpecElementType {
  REGEXP = "REGEXP",
  PARAM = "PARAM",
  WILDCARD = "WILDCARD",
}

export interface RouteSpecElementBase {
  type: RouteSpecElementType;
}

export interface RouteSpecElementLiteral extends RouteSpecElementBase {
  type: RouteSpecElementType.REGEXP;
  regexp: RegExp;
}

export interface RouteSpecElementWildcard extends RouteSpecElementBase {
  type: RouteSpecElementType.WILDCARD;
}

export interface RouteSpecElementParam extends RouteSpecElementBase {
  type: RouteSpecElementType.PARAM;
  name: string;
  required: boolean;
}

export type RouteSpecElement =
  | RouteSpecElementLiteral
  | RouteSpecElementParam
  | RouteSpecElementWildcard;

export type RouteSpec = Array<RouteSpecElement>;

export type RouteRenderer = (props: RouteProps) => JSX.Element;

export type Params = Map<string, string>;

export class Route {
  rawRouteSpec: string;
  routeSpec: RouteSpec;
  render: RouteRenderer;
  constructor(rawRouteSpec: string, render: RouteRenderer) {
    this.rawRouteSpec = rawRouteSpec;
    this.render = render;
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
          type: RouteSpecElementType.WILDCARD,
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
      } else {
        routeSpec.push({
          type: RouteSpecElementType.REGEXP,
          regexp: new RegExp(element, "i"),
        });
      }
    }

    return routeSpec;
  }

  pathToParams(hashPath: HashPath): null | Params {
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
    const params: Params = new Map();

    // console.log('hmm', this.rawRouteSpec, hashPath, this.routeSpec);

    for (const [index, routeElement] of this.routeSpec.entries()) {
      const pathElement = hashPath.path[index];
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
            params.set(routeElement.name, pathElement);
          }
          break;
        case RouteSpecElementType.WILDCARD:
          for (const pathElement of hashPath.path.slice(index)) {
            literalPathElements.push(pathElement);
          }
      }
    }

    /*
            If we get to the end, and there are more hash path elements not covered by the
            route, consider this a failure to match.
        */
    if (literalPathElements.length + params.size !== hashPath.path.length) {
      return null;
    }

    // Finally, since we have a match, extract params from the search part of the url.
    hashPath.query.forEach((value, key) => {
      params.set(key, value);
    });

    return params;
  }
}
