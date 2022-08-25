export type ISODateTimeString = string;
export interface GitInfo {
    hash: {
        full: string,
        abbreviated: string
    },
    subject: string,
    notes: string,
    author: {
        name: string,
        date: ISODateTimeString
    },
    committer: {
        name: string,
        date: ISODateTimeString
    },
    originURL: string,
    account: string,
    repoName: string,
    branch: string,
    tag?: string,
    version?: string
}

export enum PluginInfoType {
    GIT_REPO = 'GIT_REPO',
    GITHUB_RELEASE = 'GITHUB_RELEASE'
}

export interface PluginConfig {
    package: {
        name: string,
        description: string
    },
    install: {
        routes: Array<{
            path: string;
            view: string;
            authorization: boolean;
            reentrant: boolean;
        }>
    },
}

export interface PluginUIConfig {
    name: string;
    globalName: string;
    version: string;
    source: {
        github: {
            account: string;
            release?: boolean;
        };
    };
}

export interface UIPluginsConfig {
    plugins: Array<PluginUIConfig>;
}


export interface PluginInfoBase {
    type: PluginInfoType,
    install: {
        directory: string
    },
    configs: {
        plugin: PluginConfig,
        ui: PluginUIConfig
    },
}

export interface PluginInfoRepo extends PluginInfoBase {
    type: PluginInfoType.GIT_REPO,
    git: GitInfo
}

export interface PluginInfoRelease extends PluginInfoBase {
    type: PluginInfoType.GITHUB_RELEASE
}

export type PluginInfo =
    PluginInfoRepo |
    PluginInfoRelease;

export type PluginsInfo = Array<PluginInfo>;

export interface BuildInfo {
    builtAt: number
}
