import {Component} from 'react';
import {Route, RouteComponentProps, Switch} from 'react-router-dom';
import PluginWrapper from '../components/PluginWrapper/PluginWrapper';
import {AuthenticationState} from '../contexts/Auth';
import {Config} from '../types/config';

export interface CatalogProps extends RouteComponentProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
}

interface CatalogState {
}

export default class Catalog extends Component<CatalogProps, CatalogState> {
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
                    path={this.makePath('admin')}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="catalog"
                                view="catalogAdmin"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path={this.makePath('(app|apps)/:namespace/:id/:tag?')}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="catalog"
                                view="appView"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path={this.makePath('apps/:tag?')}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="catalog"
                                view="appsBrowser"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path={this.makePath('(module|modules)/:module_name')}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="catalog"
                                view="moduleView"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path={this.makePath('modules')}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="catalog"
                                view="moduleBrowser"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path={this.makePath('services')}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="catalog"
                                view="serviceCatalog"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path={this.makePath(
                        '(function|functions)/:module/:function_id/:ver?'
                    )}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="catalog"
                                view="functionView"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path={this.makePath('functions/:tag?')}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="catalog"
                                view="functionBrowser"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path={this.makePath('datatypes')}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="catalog"
                                view="datatypeBrowser"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path={this.makePath('register/:registration_id?')}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="catalog"
                                view="catalogRegistration"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path={this.makePath('stats')}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="catalog"
                                view="catalogStatus"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />

                <Route
                    path={this.makePath('status/:module_names?')}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="catalog"
                                view="catalogStatus"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path={this.makePath('queue')}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="catalog"
                                view="catalogQueue"
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path={this.makePath()}
                    render={(props) => {
                        return (
                            <PluginWrapper
                                {...props}
                                name="catalog"
                                view="catalogIndex"
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
