import React, { PropsWithChildren } from 'react';
import { AsyncProcess, AsyncProcessStatus } from '../lib/AsyncProcess';

import { Config, DeployConfig, GitInfo as ConfigGitInfo, BuildInfo as ConfigBuildInfo, PluginInfo as ConfigPluginInfo } from '../types/config';
import { PluginsInfo, GitInfo, BuildInfo } from '../types/info';

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

function gitInfoToConfig(gitInfo: GitInfo): ConfigGitInfo {
    return {
        authorDate: gitInfo.author.date,
        authorName: gitInfo.author.name,
        committerDate: gitInfo.committer.date,
        committerName: gitInfo.committer.name,
        branch: "foo", // unused?
        commitAbbreviatedHash: gitInfo.hash.abbreviated,
        commitHash: gitInfo.hash.full,
        commitNotes: "",
        originUrl: gitInfo.originURL,
        reflogSelector: "",
        subject: "",
        tag: gitInfo.tag || "n/a",
        version: gitInfo.version || "n/a"
    }
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
            ).json() as DeployConfig;

            const gitInfo = await (
                await fetch(process.env.PUBLIC_URL + '/build/git-info.json')
            ).json() as GitInfo

            const buildInfo = await (
                await fetch(process.env.PUBLIC_URL + '/build/build-info.json')
            ).json() as BuildInfo;

            const pluginsInfo = await (
                await fetch(process.env.PUBLIC_URL + '/plugins/plugin-manifest.json')
            ).json() as PluginsInfo;


            // Note that this build info is used by plugins, so we have to maintain it.
            const configBuildInfo: ConfigBuildInfo = {
                builtAt: buildInfo.builtAt,
                // These are unused, but may be necessary (TODO: determine if we can remove them.)
                hostInfo: null,
                target: "",
                stats: {
                    start: 0
                },
                git: gitInfoToConfig(gitInfo)
            }
            const configPluginsInfo: Array<ConfigPluginInfo> = pluginsInfo.map((pluginInfo) => {
                return {
                    name: pluginInfo.configs.plugin.package.name,
                    globalName: pluginInfo.configs.ui.globalName,
                    repoName: "need repo name!",
                    branch: pluginInfo.git.branch,
                    gitAccount: "need account",
                    gitInfo: gitInfoToConfig(pluginInfo.git),
                    url: pluginInfo.git.originURL,
                    version: pluginInfo.git.tag || "n/a"
                }
            });
            const config: Config = {...rawConfig, build: configBuildInfo, plugins: configPluginsInfo};
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
