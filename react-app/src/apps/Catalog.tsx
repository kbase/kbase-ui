import { Component } from 'react';
import { AuthenticationState } from '../contexts/Auth';
import { Route, SimplePluginRouteSpec } from '../lib/Route';
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

        const routeSpecs: Array<SimplePluginRouteSpec> = [
            {
                path: '^(appcatalog|catalog)$/admin',
                auth: true,
                view: 'catalogAdmin'
            },
            {
                path: 'catalog/queue',
                auth: true,
                view: 'catalogQueue'
            },
            {
                path: 'catalog',
                auth: false,
                view: 'catalogIndex'
            },
            {
                path: 'catalog/modules',
                auth: false,
                view: 'moduleBrowser'
            },
            {
                path: 'catalog/services',
                auth: true,
                view: 'serviceCatalog'
            },
            {
                path: 'catalog/datatypes',
                auth: false,
                view: 'datatypeBrowser'
            },
            {
                path: 'catalog/stats',
                auth: false,
                view: 'catalogStatus'
            },
            {
                path: '^(appcatalog|catalog)$/^(app|apps)$/:namespace/:id/:tag?',
                auth: false,
                view: 'appView'
            },
            {
                path: '^(appcatalog|catalog)$/apps/:tag?',
                auth: false,
                view: 'appsBrowser'
            },
            {
                path: 'catalog/^(module|modules)$/:module_name',
                auth: false,
                view: 'moduleView'
            },
            {
                path: 'catalog/^(function|functions)/:module/:function_id/:ver?',
                auth: false,
                view: 'functionView'
            },
            {
                path: 'catalog/functions/:tag?',
                auth: false,
                view: 'functionBrowser'
            },
            {
                path: 'catalog/register/:registration_id?',
                auth: true,
                view: 'catalogRegistration'
            },
            {
                path: 'catalog/status/:module_names?',
                auth: false,
                view: 'catalogStatus'
            }
        ];

        const routes = routeSpecs.map(({ path, view, auth }) => {
            return new Route(path, { authenticationRequired: auth }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...common}
                    view={view}
                    syncHash={false}
                />
            });
        });

        return <Router routes={routes} hashPath={this.props.hashPath} />

    }
}
