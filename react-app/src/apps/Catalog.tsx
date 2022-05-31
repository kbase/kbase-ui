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
                    syncHash={true}
                />
            }), new Route('^catalog$/(app|apps)/:namspace/:id:tag?', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="appView"
                    syncHash={true}
                />
            }), new Route('^catalog$/app', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="appsBrowser"
                    syncHash={true}
                />
            }), new Route('^catalog$/app/:tag?', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="appsBrowser"
                    syncHash={true}
                />
            }), new Route('^catalog$/(module|modules)/:module_name', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="moduleView"
                    syncHash={true}
                />
            }), new Route('^catalog$/^modules$', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="moduleBrowser"
                    syncHash={true}
                />
            }), new Route('^catalog$/^services$', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="serviceBrowser"
                    syncHash={true}
                />
            }), new Route('^catalog$/^(function|functions)/:module/:function_id/:ver?', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="functionView"
                    syncHash={true}
                />
            }), new Route('^catalog$/^functions$/:tag?', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="functionBrowser"
                    syncHash={true}
                />
            }), new Route('^catalog$/^datatypes?', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="datatypeBrowser"
                    syncHash={true}
                />
            }), new Route('^catalog$/^register$/:registration_id?', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="catalogRegistration"
                    syncHash={true}
                />
            }), new Route('^catalog$/^stats$', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="catalogStatus"
                    syncHash={true}
                />
            }), new Route('^catalog$/^status$/:module_names?', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="catalogStatus"
                    syncHash={true}
                />
            }), new Route('^catalog$/^queue$', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="catalogQueue"
                    syncHash={true}
                />
            }), new Route('^catalog$', (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view="catalogIndex"
                    syncHash={true}
                />
            })
        ];

        return <Router routes={routes} hashPath={this.props.hashPath} />

    }
}
