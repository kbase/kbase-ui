import {Component} from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {AuthenticationState} from '../../contexts/Auth';
import {RuntimeContext} from '../../contexts/RuntimeContext';
import Plugin, {Params} from '../../pluginSupport/Plugin';
import {Config} from '../../types/config';

export interface PluginWrapperProps extends RouteComponentProps {
    name: string;
    view: string;
    setTitle: (title: string) => void;
    config: Config;
    authState: AuthenticationState;
}

interface PluginWrapperState {
}

export default class PluginWrapper extends Component<PluginWrapperProps,
    PluginWrapperState> {
    render() {
        // calculate the classic kbase-ui routing info from the react-router props.

        // route params
        // route params are the combination of url parameters and query parameters.
        const queryParams = new URLSearchParams(
            this.props.location.search.substr(1)
        );
        const params = Object.assign(
            {},
            Array.from(queryParams.entries()).reduce<Params>(
                (params, [key, value]) => {
                    params[key] = value;
                    return params;
                },
                {}
            ),
            this.props.match.params,
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
        const originalHash = this.props.location.pathname;

        // setTitle(`Loading ${this.props.name}:${this.props.view}...`);

        console.log('yes, loading...', originalHash, this.props.view, params);

        return (
            <RuntimeContext.Consumer>
                {(value) => {
                    if (value === null) {
                        return null;
                    }
                    // value.setTitle(`Loading ${this.props.name}:${this.props.view}...`);
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
