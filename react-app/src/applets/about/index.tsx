import { Component } from 'react';
import NotFound from '../../components/NotFound/NotFound';
import { Config } from '../../types/config';
import AboutBuild from './AboutBuild';
import AboutKBaseUI from './AboutKBaseUI';
import AboutPlugins from './AboutPlugins';
import AboutServices from './AboutServices2';
import { AuthenticationState } from '../../contexts/Auth';
import { Route } from '../../lib/Route';
import { RouteProps, Router } from '../../components/Router2';
import { ConnectionStatus } from './ConnectionStatus/ConnectionStatus';

export interface AboutProps extends RouteProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
}

interface AboutState {
}

export default class About extends Component<AboutProps, AboutState> {
    render() {

        const routes: Array<Route> = [
            new Route('about', {authenticationRequired: false}, (props: RouteProps) => {
                return (
                    <AboutKBaseUI {...this.props} />
                );
            }),
            new Route('about/services', {authenticationRequired: false}, (props: RouteProps) => {
                return (
                    <AboutServices {...this.props} />
                );
            }),
            new Route('about/build', {authenticationRequired: false}, (props: RouteProps) => {
                return (
                    <AboutBuild {...this.props} />
                );
            }),
            new Route('about/plugins', {authenticationRequired: false}, (props: RouteProps) => {
                return (
                    <AboutPlugins {...this.props} />
                );
            }),
             new Route('about/connection', {authenticationRequired: false}, (props: RouteProps) => {
                return (
                    <ConnectionStatus {...this.props} />
                );
            }),
            new Route('about/*', {authenticationRequired: false}, (props: RouteProps) => {
                return (
                    <NotFound
                        {...this.props}
                        hashPath={props.hashPath}
                    />
                );
            }),
        ];

        return <Router routes={routes} hashPath={this.props.hashPath} />

        // return (
        //     <HashRouter>
        //         <Switch>
        //             <Route
        //                 path="/about"
        //                 exact={true}
        //                 render={(props) => {
        //                     return (
        //                         <AboutKBaseUI {...this.props} />
        //                     );
        //                 }}
        //             />
        //             <Route
        //                 path="/about/services"
        //                 exact={true}
        //                 render={(props) => {
        //                     return (
        //                         <AboutServices {...this.props} />
        //                     );
        //                 }}
        //             />
        //             <Route
        //                 path="/about/build"
        //                 exact={true}
        //                 render={(props) => {
        //                     return (
        //                         <AboutBuild {...this.props} />
        //                     );
        //                 }}
        //             />
        //             <Route
        //                 path="/about/plugins"
        //                 exact={true}
        //                 render={(props) => {
        //                     return (
        //                         <AboutPlugins {...this.props} />
        //                     );
        //                 }}
        //             />
        //             <Route
        //                 path="/about/*"
        //                 render={(props) => {
        //                     return (
        //                         <NotFound
        //                             {...this.props}
        //                             realPath={props.location.pathname}
        //                             hashPath={props.location.hash}
        //                             params={
        //                                 new URLSearchParams(
        //                                     props.location.search.substring(1)
        //                                 )
        //                             }
        //                         />
        //                     );
        //                 }}
        //             ></Route>
        //         </Switch>
        //     </HashRouter>
        // );
    }
}
