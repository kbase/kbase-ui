import { Component } from 'react';
import ErrorMessage from '../components/ErrorMessage';
import PluginWrapper2 from '../components/PluginWrapper/PluginWrapper2';
import { RouteProps, Router } from '../components/Router2';
import { AuthenticationState } from '../contexts/Auth';
import RouterWrapper, { HashPath, RouterContext } from '../contexts/RouterContext';
import { AsyncProcessStatus } from '../lib/AsyncProcess2';
import { Route } from '../lib/Route';
import { Config } from '../types/config';

export interface AuthProps extends RouteProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
}

interface AuthState {
}

export default class Catalog extends Component<AuthProps, AuthState> {
    makePath(extraPath?: string) {
        if (extraPath) {
            return `${this.props.hashPath.path}/${extraPath}`;
        } else {
            return this.props.hashPath.path;
        }
    }

    render() {
        const common = {
            name: "auth2-client",
            setTitle: this.props.setTitle,
            authState: this.props.authState,
            config: this.props.config
        };
        const routes = [
            new Route('account', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="account"
                />
            }),
            new Route('auth2/account', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="account"
                />
            }),
            new Route('login', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="login"
                />
            }),
            new Route('signup', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="signup"
                />
            }),
            new Route('auth2/signedout', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="signedout"
                />
            }),
            new Route('auth2/login/continue', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="loginContinue"
                />
            }),
            new Route('auth2/link/continue', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="linkContinue"
                />
            })
        ];

        return (
            <RouterContext.Consumer>
                {(value) => {
                    // console.log('VALUE is', value);
                    switch (value.status) {
                        case AsyncProcessStatus.NONE:
                            return <div />;
                        case AsyncProcessStatus.PENDING:
                            return <div />;
                        case AsyncProcessStatus.ERROR:
                            return <ErrorMessage message={value.error.message} />;
                        case AsyncProcessStatus.SUCCESS:
                            return <Router routes={routes} hashPath={value.value.hashPath} />;
                    }
                }}
            </RouterContext.Consumer>
        );
        // return <Router routes={routes} hashPath={this.props.hashPath} />;
        // 1
        // return (
        // <Switch>
        //     <Route
        //         path={this.makePath('account')}
        //         render={(props) => {
        //             return (
        //                 <PluginWrapper
        //                     {...props}
        //                     name="auth2-client"
        //                     view="account"
        //                     setTitle={this.props.setTitle}
        //                     authState={this.props.authState}
        //                     config={this.props.config}
        //                 />
        //             );
        //         }}
        //     />
        //     <Route
        //         path={this.makePath('signedout')}
        //         render={(props) => {
        //             return (
        //                 <PluginWrapper
        //                     {...props}
        //                     name="auth2-client"
        //                     view="signedout"
        //                     setTitle={this.props.setTitle}
        //                     authState={this.props.authState}
        //                     config={this.props.config}
        //                 />
        //             );
        //         }}
        //     />
        //     <Route
        //         path={this.makePath('login/continue')}
        //         render={(props) => {
        //             return (
        //                 <PluginWrapper
        //                     {...props}
        //                     name="auth2-client"
        //                     view="loginContinue"
        //                     setTitle={this.props.setTitle}
        //                     authState={this.props.authState}
        //                     config={this.props.config}
        //                 />
        //             );
        //         }}
        //     />
        //     <Route
        //         path={this.makePath('link/continue')}
        //         render={(props) => {
        //             return (
        //                 <PluginWrapper
        //                     {...props}
        //                     name="auth2-client"
        //                     view="linkContinue"
        //                     setTitle={this.props.setTitle}
        //                     authState={this.props.authState}
        //                     config={this.props.config}
        //                 />
        //             );
        //         }}
        //     />

        //     <Route
        //         path="/account"
        //         render={(props) => {
        //             return (
        //                 <PluginWrapper
        //                     {...props}
        //                     name="auth2-client"
        //                     view="account"
        //                     setTitle={this.props.setTitle}
        //                     authState={this.props.authState}
        //                     config={this.props.config}
        //                 />
        //             );
        //         }}
        //     />

        //     <Route
        //         path="/login"
        //         render={(props) => {
        //             return (
        //                 <PluginWrapper
        //                     {...props}
        //                     name="auth2-client"
        //                     view="login"
        //                     setTitle={this.props.setTitle}
        //                     authState={this.props.authState}
        //                     config={this.props.config}
        //                 />
        //             );
        //         }}
        //     />
        //     <Route
        //         path="/signup"
        //         render={(props) => {
        //             return (
        //                 <PluginWrapper
        //                     {...props}
        //                     name="auth2-client"
        //                     view="signup"
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
