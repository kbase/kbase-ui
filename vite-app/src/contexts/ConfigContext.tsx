import { resourceURL } from 'lib/navigation';
import React, { PropsWithChildren } from 'react';
import { AsyncProcess, AsyncProcessStatus } from '../lib/AsyncProcess';
import { Config, PluginInfo as ConfigPluginInfo, DeployConfig } from '../types/config';
import { BuildInfo, GitInfo, PluginsInfo } from '../types/info';

function buildUIURL(config: Config, path: string, params?: Record<string, string>): URL {
    if (params) {
        const search = new URLSearchParams(params).toString();
        return new URL(`${config.deploy.ui.origin}#${path}&${search}`);
    }
    return new URL(`${config.deploy.ui.origin}#${path}`);
}

// export type NavigationPathToURL = ({path, params, type}: NavigationPath, 
//                                     newWindow: boolean) => URL;

/**
 * Holds the current config information
 */
export interface ConfigInfo {
    config: Config,
    pluginsInfo: PluginsInfo,
    gitInfo: GitInfo,
    buildInfo: BuildInfo
    // Some handy config utilities.
    uiURL: (path: string, params?: Record<string, string>) => URL
    // navigationPathToURL: NavigationPathToURL

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

export type ConfigWrapperProps = PropsWithChildren<{
    // config: Config;
}>;

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
                await fetch(resourceURL('deploy/config.json'))
            ).json() as DeployConfig;

            const gitInfo = await (
                await fetch(resourceURL('build/git-info.json'))
            ).json() as GitInfo

            const buildInfo = await (
                await fetch(resourceURL('build/build-info.json'))
            ).json() as BuildInfo;

            const pluginsInfo = await (
                await fetch(resourceURL('plugins/plugin-manifest.json'))
            ).json() as PluginsInfo;

            const uiURL = (path: string, params?: Record<string, string>) => {
                return buildUIURL(config, path, params);
            }

            // Note that this build info is used by plugins, so we have to maintain it.

            const configPluginsInfo: Array<ConfigPluginInfo> = pluginsInfo.map((pluginInfo) => {
                return {
                    name: pluginInfo.configs.plugin.package.name,
                    globalName: pluginInfo.configs.ui.globalName,
                    repoName: "need repo name!",
                    branch: "don't always have branch",
                    gitAccount: "need account",
                    // remove for now
                    // gitInfo: gitInfoToConfig(pluginInfo.git),
                    url: "url here",
                    version: pluginInfo.configs.ui.version
                }
            });
            const config: Config = { ...rawConfig, buildInfo, gitInfo, plugins: configPluginsInfo };
            this.setState({
                configState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        config,
                        pluginsInfo,
                        gitInfo,
                        buildInfo,
                        uiURL,
                        // navigationPathToURL: createNavigationPathToURL(config)
                    },
                },
            });
        } catch (ex) {
            // TODO: need to communicate done with error to Europa; but this occurs
            // before Europa integration begins, so some refactoring required.
            console.error('ERROR', ex);

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
