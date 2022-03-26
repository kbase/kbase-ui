import React from 'react';
import { AsyncProcess, AsyncProcessStatus } from '../lib/AsyncProcess';

import { Config } from '../types/config';

/**
 * Holds the current config information
 */
export interface ConfigInfo {
    config: Config;
}

export type ConfigState = AsyncProcess<ConfigInfo, string>;

// Context

/**
 * The AuthContext is the basis for propagating auth state
 * throughout the app.
 */

export const ConfigContext = React.createContext<ConfigState>({
    status: AsyncProcessStatus.NONE,
});

// Auth Wrapper Component

export interface ConfigWrapperProps {
    // config: Config;
}

interface ConfigWrapperState {
    configState: ConfigState;
}

/**
 * Wraps a component tree, ensuring that authentication status is
 * resolved and placed into the AuthContext. The auth state in the
 * context can then be used by descendants to do "the right thing".
 * In this app, the right thing is to show an error message if
 * there is lack of authentication (no token, invalid token), and to
 * proceed otherwise.
 *
 * Also note that the auth state is itself wrapped into an AsyncProcess,
 * which ensures that descendants can handle the async behavior of
 * determining the auth state (because we may need to call the auth service),
 * which includes any errors encountered.
 */
export default class ConfigWrapper extends React.Component<
    ConfigWrapperProps,
    ConfigWrapperState
> {
    constructor(props: ConfigWrapperProps) {
        super(props);
        this.state = {
            configState: {
                status: AsyncProcessStatus.NONE,
            },
        };
    }

    componentDidMount() {
        this.fetchConfig();
    }

    async fetchConfig(): Promise<void> {
        this.setState({
            configState: {
                status: AsyncProcessStatus.PENDING,
            },
        });
        try {
            const rawConfig = await (
                await fetch(process.env.PUBLIC_URL + '/deploy/config.json')
            ).json();
            this.setState({
                configState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        config: rawConfig as unknown as Config,
                    },
                },
            });
        } catch (ex) {
            this.setState({
                configState: {
                    status: AsyncProcessStatus.ERROR,
                    error: (() => {
                        if (ex instanceof Error) {
                            return ex.message;
                        }
                        return 'Unknown error';
                    })(),
                },
            });
        }
    }

    render() {
        return (
            <ConfigContext.Provider value={this.state.configState}>
                {this.props.children}
            </ConfigContext.Provider>
        );
    }
}
