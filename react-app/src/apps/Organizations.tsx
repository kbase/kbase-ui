import { Component } from 'react';
import PluginWrapper2 from '../components/PluginWrapper/PluginWrapper2';
import { RouteProps, Router } from '../components/Router2';
import { AuthenticationState } from '../contexts/Auth';
import { Route } from '../lib/Route';
import { Config } from '../types/config';

export interface OrganizationsProps extends RouteProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
}

interface OrganizationsState {
}

export default class Organizations extends Component<OrganizationsProps,
    OrganizationsState> {
    // makePath(extraPath?: string) {
    //     if (extraPath) {
    //         return `${this.props.path}/${extraPath}`;
    //     } else {
    //         return this.props.path;
    //     }
    // }



    render() {
        const common = {
            name: "organizations",
            setTitle: this.props.setTitle,
            authState: this.props.authState,
            config: this.props.config
        };

        const routes: Array<Route> = [
            new Route('^orgs/new$', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="newOrg"
                    syncHash={false}
                />
            }),
            new Route('^orgs$/:organizationId', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="viewOrg"
                    syncHash={false}
                />
            }),
            new Route('^orgs$', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="browseOrgs"
                    syncHash={false}
                />
            })
        ];

        return <Router routes={routes} hashPath={this.props.hashPath} />
        // return (
        // <Switch>
        //     <Route
        //         path={this.makePath('new')}
        //         render={(props) => {
        //             return (
        //                 <PluginWrapper
        //                     {...props}
        //                     name="organizations"
        //                     view="newOrg"
        //                     setTitle={this.props.setTitle}
        //                     authState={this.props.authState}
        //                     config={this.props.config}
        //                 />
        //             );
        //         }}
        //     />
        //     <Route
        //         path={this.makePath(':organizationId')}
        //         render={(props) => {
        //             return (
        //                 <PluginWrapper
        //                     {...props}
        //                     name="organizations"
        //                     view="viewOrg"
        //                     setTitle={this.props.setTitle}
        //                     authState={this.props.authState}
        //                     config={this.props.config}
        //                 />
        //             );
        //         }}
        //     />
        //     <Route
        //         path={this.makePath()}
        //         exact={true}
        //         render={(props) => {
        //             return (
        //                 <PluginWrapper
        //                     {...props}
        //                     name="organizations"
        //                     view="browseOrgs"
        //                     setTitle={this.props.setTitle}
        //                     authState={this.props.authState}
        //                     config={this.props.config}
        //                 />
        //             );
        //         }}
        //     />
        // </Switch>
        // );
    }
}
