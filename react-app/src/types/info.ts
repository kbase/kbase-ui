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

export interface PluginInfo {
    install: {
        directory: string
    },
    configs: {
        plugin: {
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
        },
        ui: {
            name: string,
            globalName: string,
            version: string;
            source: {
                github: {
                    account: string
                }
            }
        }
    },
    git: GitInfo
}

export type PluginsInfo = Array<PluginInfo>;

export interface BuildInfo {
    builtAt: number
}
