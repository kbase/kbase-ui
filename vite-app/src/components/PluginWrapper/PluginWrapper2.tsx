import { AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { AuthenticationState, EuropaContext } from '../../contexts/EuropaContext';
import Plugin from '../../pluginSupport/Plugin';
import { Config } from '../../types/config';
import { RouteProps } from '../Router2';

export interface PluginWrapperProps extends RouteProps {
    name: string;
    view: string;
    syncHash: boolean;
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
        const params = Object.fromEntries(this.props.match.params);
      
        // view
        // the abstract view id - e.g. #catalog or #/catalog are "catalog", #dataview/1/2/3 is "dataview",
        // "#auth2/login" is "auth2-login", etc. This value should be provided by the route.

        // originalPath
        // The original hash path string.
        const originalHash = this.props.hashPath.hash;

        return (
            <EuropaContext.Consumer>
                {(value) => {
                    if (value === null || value.status !== AsyncProcessStatus.SUCCESS) {
                        return null;
                    }
                    const {setTitle, authState, config, messenger} = value.value;
                    return (
                        <Plugin
                            setTitle={setTitle}
                            authState={authState}
                            config={config}
                            messenger={messenger}
                            name={this.props.name}
                            syncHash={this.props.syncHash}
                            original={originalHash}
                            params={params}
                            view={this.props.view}
                        />
                    );
                }}
            </EuropaContext.Consumer>
        );
    }
}
