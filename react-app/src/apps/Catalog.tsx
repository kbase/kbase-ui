import { Component } from 'react';
import { AuthenticationState } from '../contexts/Auth';
import { Route } from '../lib/Route';
import { Config } from '../types/config';
import PluginWrapper2 from '../components/PluginWrapper/PluginWrapper2';
import { RouteProps, Router } from '../components/Router2';

export interface CatalogProps extends RouteProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
}

interface CatalogState {
}

export default class Catalog extends Component<CatalogProps, CatalogState> {


    render() {
        const common = {
            name: "catalog",
            setTitle: this.props.setTitle,
            authState: this.props.authState,
            config: this.props.config
        };

        const routes = [
            new Route('^catalog/admin$', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="catalogAdmin"
                />
            }), new Route('^catalog$/(app|apps)/:namspace/:id:tag?', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="appView"
                />
            }), new Route('^catalog$/app', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="appsBrowser"
                />
            }), new Route('^catalog$/app/:tag?', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="appsBrowser"
                />
            }), new Route('^catalog$/(module|modules)/:module_name', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="moduleView"
                />
            }), new Route('^catalog$/^modules$', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="moduleBrowser"
                />
            }), new Route('^catalog$/^services$', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="serviceBrowser"
                />
            }), new Route('^catalog$/^(function|functions)/:module/:function_id/:ver?', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="functionView"
                />
            }), new Route('^catalog$/^functions$/:tag?', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="functionBrowser"
                />
            }), new Route('^catalog$/^datatypes?', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="datatypeBrowser"
                />
            }), new Route('^catalog$/^register$/:registration_id?', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="catalogRegistration"
                />
            }), new Route('^catalog$/^stats$', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="catalogStatus"
                />
            }), new Route('^catalog$/^status$/:module_names?', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="catalogStatus"
                />
            }), new Route('^catalog$/^queue$', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="catalogQueue"
                />
            }), new Route('^catalog$', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="catalogIndex"
                />
            })
        ];

        return <Router routes={routes} hashPath={this.props.hashPath} />

    }
}
