import {Component} from 'react';
import {Route, RouteComponentProps, Switch} from 'react-router-dom';
import PluginWrapper from '../components/PluginWrapper/PluginWrapper';
import {AuthenticationState} from '../contexts/Auth';
import {Config} from '../types/config';

export interface OrganizationsProps extends RouteComponentProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
}

interface OrganizationsState {
}

export default class Organizations extends Component<OrganizationsProps,
    OrganizationsState> {
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
                    path={this.makePath('new')}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="organizations"
                                view="newOrg"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path={this.makePath(':organizationId')}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="organizations"
                                view="viewOrg"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path={this.makePath()}
                    exact={true}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="organizations"
                                view="browseOrgs"
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
