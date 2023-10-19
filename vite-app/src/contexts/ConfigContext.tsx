import React, { PropsWithChildren } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AsyncProcess, AsyncProcessStatus } from '../lib/AsyncProcess';

import { Config, PluginInfo as ConfigPluginInfo, DeployConfig } from '../types/config';
import { BuildInfo, GitInfo, PluginsInfo } from '../types/info';


/**
 * Holds the current config information
 */
export interface ConfigInfo {
    config: Config,
    pluginsInfo: PluginsInfo,
    gitInfo: GitInfo,
    buildInfo: BuildInfo
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



function hostURL(path: string) {
    const baseURL = new URL(window.location.href);
    const newPath = `${import.meta.env.BASE_URL}/${path}`
        .split('/')
        .filter((pathElement) => { return pathElement.trim() !== '' }).join('/');
    baseURL.pathname = newPath;
    // We have a dilemma here -- we can't use the version as the cache buster as 
    // it we don't know it yet (it is in the config files!) -- so we use a uuid
    // but this means that the config is loaded fresh each time. They are small, so 
    // that is okay for now.
    // TODO: configs can be installed into the source tree so that we can simply
    // import them. This will require changes to the dev proxies.
    baseURL.searchParams.set('cb', uuidv4());
    return baseURL;
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
                await fetch(hostURL('deploy/config.json'))
            ).json() as DeployConfig;

            const gitInfo = await (
                await fetch(hostURL('build/git-info.json'))
            ).json() as GitInfo

            const buildInfo = await (
                await fetch(hostURL('build/build-info.json'))
            ).json() as BuildInfo;

            const pluginsInfo = await (
                await fetch(hostURL('plugins/plugin-manifest.json'))
            ).json() as PluginsInfo;

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
                        buildInfo
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
