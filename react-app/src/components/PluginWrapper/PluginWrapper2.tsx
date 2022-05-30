import { Component } from 'react';
// import { RouteComponentProps } from 'react-router-dom';
import { AuthenticationState } from '../../contexts/Auth';
import { RuntimeContext } from '../../contexts/RuntimeContext';
import Plugin, { Params } from '../../pluginSupport/Plugin';
import { Config } from '../../types/config';
import { RouteProps, RouterProps } from '../Router2';



export interface PluginWrapperProps extends RouteProps {
    name: string;
    view: string;
    setTitle: (title: string) => void;
    config: Config;
    authState: AuthenticationState;
}

interface PluginWrapperState { }

export default class PluginWrapper extends Component<
    PluginWrapperProps,
    PluginWrapperState
> {
    render() {
        // calculate the classic kbase-ui routing info from the react-router props.

        // route params
        // route params are the combination of url parameters and query parameters.
        const queryParams = this.props.hashPath.query;
        const params = Object.assign(
            {},
            Array.from(queryParams.entries()).reduce<Params>(
                (params, [key, value]) => {
                    params[key] = value;
                    return params;
                },
                {}
            ),
            Object.fromEntries(this.props.params),
            {
                view: this.props.view,
            }
        );
        // const params: Params = {};

        // view
        // the abstract view id - e.g. #catalog or #/catalog are "catalog", #dataview/1/2/3 is "dataview",
        // "#auth2/login" is "auth2-login", etc. This value should be provided by the route.

        // originalPath
        // The original hash path string.
        const originalHash = this.props.hashPath.hash;

        // setTitle(`Loading ${this.props.name}:${this.props.view}...`);

        return (
            <RuntimeContext.Consumer>
                {(value) => {
                    if (value === null) {
                        return null;
                    }
                    // value.setTitle(`Loading ${this.props.name}:${this.props.view}...`);
                    // console.log('rendering plugin', value.config);
                    return (
                        <Plugin
                            setTitle={value.setTitle}
                            authState={value.authState}
                            config={value.config}
                            messenger={value.messenger}
                            name={this.props.name}
                            original={originalHash}
                            params={params}
                            view={this.props.view}
                        />
                    );
                }}
            </RuntimeContext.Consumer>
        );
    }
}
