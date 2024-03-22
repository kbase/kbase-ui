import {
    AuthenticationStateAuthenticated,
    AuthenticationStatus,
    EuropaContext,
} from 'contexts/EuropaContext';
import { nextRequestFromCurrentURL } from 'lib/NextRequest';
import { navigate2 } from 'lib/navigation';
import { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ConfigContext } from '../contexts/ConfigContext';
import { HashPath } from '../contexts/RouterContext';
import { AsyncProcessStatus } from '../lib/AsyncProcess';
import { MatchedHashPath, Route } from '../lib/Route';

export interface RouteProps {
    hashPath: HashPath;
    match: MatchedHashPath;
}
export interface AuthenticatedRouteProps extends RouteProps {
    auth: AuthenticationStateAuthenticated;
}
export type Query = Map<string, string>;

// export type RouteMap = Map<string, Route>;

/**
 *  Router component implementation
 */

export interface RouterProps {
    hashPath: HashPath;
    routes: Array<Route>;
    authRoute: Route
}

interface RouterState {
    // hashPath: HashPath;
}

export interface RouteMount {
    id: string;
    route: Route;
}

export class Router extends Component<RouterProps, RouterState> {
    routes: Array<RouteMount>;
    constructor(props: RouterProps) {
        super(props);

        this.routes = props.routes.map((route) => {
            return {
                id: uuidv4(),
                route,
            };
        });
    }

    renderRoute(route: Route, hashPath: HashPath, match: MatchedHashPath) {
        return (
            <ConfigContext.Consumer>
                {(configValue) => {
                    if (configValue.status !== AsyncProcessStatus.SUCCESS) {
                        return null;
                    }
                    return (
                        <EuropaContext.Consumer>
                            {(value) => {
                                if (value.status !== AsyncProcessStatus.SUCCESS) {
                                    return null;
                                }
                                if (route.routeOptions.authenticationRequired) {
                                    if (
                                        value.value.authState.status !==
                                        AuthenticationStatus.AUTHENTICATED
                                    ) {
                                        // TODO: render route auth error message and/or
                                        // route to login with the path.

                                        // TODO: left off here.
                                        // Instead of using component to perform a
                                        // redirect, we should invoke the login
                                        // component directly here by simply having a
                                        // handle on the special login route.

                                        // Create the nextrequest directly here!

                                        const nextRequest = nextRequestFromCurrentURL();
                                        nextRequest.label = route.label;

                                        // If a captured "next request" includes the
                                        // "europa" flag, remove it. This flag is meant
                                        // to prevent a navigation loop when kbase-ui
                                        // notifies europa of a navigation event that
                                        // should be reflected in the top level location.
                                        if (nextRequest.path.params && Object.keys(nextRequest.path.params).includes('europa')) {
                                            delete nextRequest.path.params['europa'];
                                        }

                                        if (!hashPath.params) {
                                            hashPath.params = {};
                                        }

                                        hashPath.params['nextrequest'] = JSON.stringify(nextRequest);

                                        return this.props.authRoute.render({hashPath, match})
                                    }
                                    return route.render({
                                        hashPath, match
                                    });
                                }

                                return route.render({
                                    hashPath, match
                                });
                            }}
                        </EuropaContext.Consumer>
                    );
                }}
            </ConfigContext.Consumer>
        );
    }

    render() {
        const hashPath = this.props.hashPath;

        // Invoke the first route found
        for (const route of this.props.routes) {
            // TODO: fix this.
            // the following should be the route match, so rename this.
            // and if there is a match, we should return the rendered route,
            // passing the PARAMS as well as the hash path.
            // FOr some reason the params extraction is ...???
            const match = route.matchHashPath(hashPath);

            if (match) {
                return this.renderRoute(route, hashPath, match);
            }
        }

        // Instead of showing the "not found" view, invoke the "fallback" path in
        // Europa.
        // TODO: send params or not? Europa does not accept arbitrary search params, so
        // they'd need to be encoded as JSON or something similar:
        // params: hashPath.params, 
        navigate2({path: `fallback/${hashPath.hash}`, type: 'europaui'});
    }
}
