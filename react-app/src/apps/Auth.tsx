import {Component} from 'react';
import {Route, RouteComponentProps, Switch} from 'react-router-dom';
import PluginWrapper from '../components/PluginWrapper/PluginWrapper';
import {AuthenticationState} from '../contexts/Auth';
import {Config} from '../types/config';

export interface AuthProps extends RouteComponentProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
}

interface AuthState {
}

export default class Catalog extends Component<AuthProps, AuthState> {
    makePath(extraPath?: string) {
        if (extraPath) {
            return `${this.props.match.path}/${extraPath}`;
        } else {
            return this.props.match.path;
        }
    }

    render() {
        return (
            <Switch>
                <Route
                    path={this.makePath('account')}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="auth2-client"
                                view="account"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path={this.makePath('signedout')}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="auth2-client"
                                view="signedout"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path={this.makePath('login/continue')}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="auth2-client"
                                view="loginContinue"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path={this.makePath('link/continue')}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="auth2-client"
                                view="linkContinue"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />

                <Route
                    path="/account"
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="auth2-client"
                                view="account"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />

                <Route
                    path="/login"
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="auth2-client"
                                view="login"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path="/signup"
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="auth2-client"
                                view="signup"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
            </Switch>
        );
    }
}
