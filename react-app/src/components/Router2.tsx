import { Component } from 'react';
import { Params, Route } from '../lib/Route';
import { v4 as uuidv4 } from 'uuid'
import { HashPath } from '../contexts/RouterContext';
import {ConfigContext} from '../contexts/ConfigContext';
import { AsyncProcessStatus } from '../lib/AsyncProcess';
import { AuthContext, AuthenticationStatus } from '../contexts/Auth';
import NotFound from './NotFound/NotFound';
import AuthProblem from './AuthProblem';
import { RuntimeContext } from '../contexts/RuntimeContext';

// interface Route {
//     render: (props: RouteProps) => JSX.Element | Element | ReactNode
// }
export interface RouteProps {
    hashPath: HashPath;
    params: Map<string, string>;
}
export type Query = Map<string, string>;


// export type RouteMap = Map<string, Route>;

/**
 *  Router component implementation
 */

export interface RouterProps {
    hashPath: HashPath
    routes: Array<Route>;
}

interface RouterState {
    // hashPath: HashPath;
}

export interface RouteMount {
    id: string;
    route: Route;
}


export class Router extends Component<RouterProps, RouterState> {
    // routes: Map<string, Route> = new Map()
    routes: Array<RouteMount>;
    constructor(props: RouterProps) {
        super(props);

        this.routes = props.routes.map((route) => {
            return {
                id: uuidv4(),
                route
            }
        })

        // this.state = {
        //     hashPath
        // }

        // this.routes.set('catalog', {
        //     render: () => {

        //         console.log('HERE in the catalog!');
        //         return <div>
        //             Here is the catalog via the new router...
        //         </div>
        //     }
        // })

        // this.routes.set('feeds', {
        //     render: () => {
        //         return (
        //             <PluginWrapper
        //                 name="feeds"
        //                 view="feeds"
        //                 {...this.props}
        //             />
        //         );
        //     }
        // })
    }

    // componentDidMount() {
    //     window.addEventListener('hashchange', () => {
    //         console.log('hash change', window.location.hash);
    //         // this.render();
    //         this.forceUpdate();
    //     });
    // }

    // getHashPath(): HashPath {
    //     const hash = document.location.hash.substring(1);
    //     const path = hash.split('/')
    //         .filter((component) => {
    //             return component.length > 0;
    //         })
    //     const query = new URLSearchParams(document.location.search);
    //     // const query = Array.from(queryParams.entries()).reduce((query, [key, value]) => {
    //     //     query.
    //     //     return query;
    //     // }, new Map());
    //     return {
    //         hash, path, query, params: new Map()
    //     }
    // }

    renderRoute(route: Route, hashPath: HashPath, params: Params) {
        return <ConfigContext.Consumer>
            {(configValue) => { 
                if (configValue.status !== AsyncProcessStatus.SUCCESS) {
                    return null;
                }
                return <AuthContext.Consumer>
                    {(authValue) => {
                         if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (route.routeOptions.authenticationRequired) {
                            if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                                // TODO: render route auth error message and/or
                                // route to login with the path.
                                return <AuthProblem 
                                    hashPath={this.props.hashPath}
                                    message="Access Denied"

                                />
                            }
                            return route.render({
                                hashPath,
                                params
                            });
                        } 
                        return route.render({
                            hashPath,
                            params
                        });
                        
                    }}
                </AuthContext.Consumer>
            }}
        </ConfigContext.Consumer>
    }

    render() {
        const hashPath = this.props.hashPath;
        for (const route of this.props.routes) {
            const params = route.pathToParams(hashPath)
            // TODO: huh?
            if (params !== null) {
                return this.renderRoute(route, hashPath, params)
            }
        }

        return <RuntimeContext.Consumer>
            {(value) => {
                return <NotFound hashPath={hashPath} setTitle={value!.setTitle}/>
            }}
        </RuntimeContext.Consumer>
        
    }
}