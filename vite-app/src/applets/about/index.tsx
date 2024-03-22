import { SignIn } from 'apps/Auth2/SignIn/SignIn';
import { Component } from 'react';
import NotFound from '../../components/NotFound/NotFound';
import { RouteProps, Router } from '../../components/Router2';
import { AuthenticationState } from '../../contexts/EuropaContext';
import { Route } from '../../lib/Route';
import { Config } from '../../types/config';
import AboutBuild from './AboutBuild';
import AboutKBaseUI from './AboutKBaseUI';
import AboutMenu from './AboutMenu';
import AboutPlugins from './AboutPlugins';
import AboutServices from './AboutServices';
import AboutSessionController from './AboutSession/controller';
import { ConnectionStatus } from './ConnectionStatus/ConnectionStatus';
import styles from './index.module.css';

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
            new Route('about', { authenticationRequired: false }, () => {
                return (
                    <AboutKBaseUI {...this.props} />
                );
            }),
            new Route('about/kbase-ui', { authenticationRequired: false }, () => {
                return (
                    <AboutKBaseUI {...this.props} />
                );
            }),
            new Route('about/services', { authenticationRequired: false }, () => {
                return (
                    <AboutServices {...this.props} />
                );
            }),
            new Route('about/build', { authenticationRequired: false }, () => {
                return (
                    <AboutBuild {...this.props} />
                );
            }),
            new Route('about/plugins', { authenticationRequired: false }, () => {
                return (
                    <AboutPlugins {...this.props} />
                );
            }),
            new Route('about/connection', { authenticationRequired: false }, () => {
                return (
                    <ConnectionStatus {...this.props} />
                );
            }),            
            new Route('about/session', { authenticationRequired: false }, () => {
                return (
                    <AboutSessionController {...this.props} />
                );
            }),
            new Route('about/*', { authenticationRequired: false }, (props: RouteProps) => {
                return (
                    <NotFound
                        {...this.props}
                        hashPath={props.hashPath}
                    />
                );
            }),
        ];

        const authRoute = new Route(
            '^login|signin|signup$', 
            {authenticationRequired: false}, 
            (props: RouteProps) => {
                return <SignIn 
                    {...props} 
                    key={props.hashPath.hash} 
                    source="authorization"
                    config={this.props.config}
                    authState={this.props.authState}
                    setTitle={this.props.setTitle}
                />
            }
        )

        return <div className={styles.main}>
            <div className={styles.menu}>
                <AboutMenu tab={this.props.match.params.get('name') || 'kbase-ui'}/>
            </div>
            <div className={styles.body}>
                <Router routes={routes} hashPath={this.props.hashPath} authRoute={authRoute}/>
            </div>
        </div>;

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
