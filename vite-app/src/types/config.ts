import { NavigationPath } from "lib/navigation";
import { Menu } from "./menu";

export interface UIServiceConfig {
    name: string;
}

export type CoreServiceType = "rest" | "jsonrpc" | "jsonrpc2";

export interface CoreServiceConfig {
    aliases?: Array<string>;
    module: string;
    url: string;
    name: string;
    type: CoreServiceType;
}

export interface RestServiceConfig extends CoreServiceConfig {
    type: "rest";
    version: {
        path: string;
        propertyPath?: string;
        semverNotImplemented?: boolean;
    };
}

export interface JSONRPC11ServiceConfig extends CoreServiceConfig {
    type: "jsonrpc";
    version?: {
        method: string;
    };
    status?: {
        method: string;
    };
}

export interface JSONRPC20ServiceConfig extends CoreServiceConfig {
    type: "jsonrpc2";
    version?: {
        method: string;
    };
}

export interface IDProvider {
    id: string;
    label: string;
    logoutUrl: string;
    priority: number;
    confirmSignin: boolean;
    description: string;
}

export interface Auth2ServiceConfig extends RestServiceConfig {
    cookieName: string;
    extraCookieNames: Array<CookieConfig>;
    providers: Array<string>;
    supportedProviders: Array<IDProvider>;
}

export type CatalogServiceConfig = JSONRPC11ServiceConfig;

export type FeedsServiceConfig = RestServiceConfig;

export type GroupsServiceConfig = RestServiceConfig;

export type RelationEngineServiceConfig = RestServiceConfig;

export type ORCIDLinkServiceConfig = RestServiceConfig;

export type NarrativeJobServiceConfig = JSONRPC11ServiceConfig;

export interface NarrativeMethodStoreConfig extends JSONRPC11ServiceConfig {
    image_url: string;
}

export type UserProfileServiceConfig = JSONRPC11ServiceConfig;

export type SampleServiceConfig = JSONRPC11ServiceConfig;

export type ServiceWizardConfig = JSONRPC11ServiceConfig;

export type WorkspaceServiceConfig = JSONRPC11ServiceConfig;

export interface SearchAPI2ServiceConfig extends JSONRPC20ServiceConfig {
    legacyUrl: string;
}

export type SearchAPI2LegacyServiceConfig = JSONRPC11ServiceConfig;

export type ExecutionEngineServiceConfig = JSONRPC11ServiceConfig;

export interface LinkInfo {
    url: string;
    title: string;
}

export interface DynamicServiceConfig {
    module: string;
    version: "auto" | "dev" | "beta" | "release";
}

export interface GitInfo {
    hash: {
        full: string
        abbreviated: string
    }
    subject: string
    notes: string
    author: {
        name: string
        date: string
    }
    committer: {
        name: string
        date: string
    },
    originURL: string
    account: string
    repoName: string
    branch: string
    tag?: string
    version?: string
}

export type ISODateTimeString = string;

export interface BuildInfo {
    builtAt: number;
}

export interface PluginInfo {
    name: string;
    globalName: string;
    repoName: string;
    version: string;
    branch: string;
    gitAccount: string;
    url: string;
    // gitInfo: GitInfo;
}

export interface HamburgerMenuDefintion {
    narrative: Menu;
    search: Menu;
    developer: Menu;
    help: Menu;
}

export interface CookieConfig {
    name: string;
    maxAge: number;
}

// // A kbase-ui endpoint
// export interface NavigationEndpointInternal {
//     hash: string;
//     params?: Record<string, string>;
//     newWindow?: boolean;
// }

// // Another ui endpoint on the same host
// export interface NavigationEndpointExternal {
//     path: string;
//     hash?: string;
//     params?: Record<string, string>;
//     newWindow?: boolean;
// }


// export interface NavigationEndpoint {
//     hash?: string;
//     path?: string;
//     params?: Record<string, string>;
//     external?: boolean;
//     newWindow?: boolean;
// }

// export interface DefaultPath {
//     type: 'hash' | 'path',
//     value: string
// }

// export interface DefaultNavigationPathKBaseUI {
//     hash: string;
//     params?: Record<string, string>
// }

// export interface DefaultNavigationPathEuropa {
//     pathname: string;
//     params?: Record<string, string>
// }

// export type DefaultNavigationPath = DefaultNavigationPathKBaseUI | DefaultNavigationPathEuropa;


export interface DeployConfig {
    deploy: {
        id: string;
        target: string;
        // basePath: string;
        hostname: string;
        ui: {
            origin: string;
        };
    };
    ui: {
        apps: {
            NarrativeManager: {
                loadingTimers: {
                    slow: number;
                    verySlow: number;
                }
            }
        }
        services: {
            connection: UIServiceConfig;
            coreService: UIServiceConfig;
            instrumentation: UIServiceConfig;
            notification: UIServiceConfig;
            session: UIServiceConfig & {
                cookie: CookieConfig;
                loginWidget: string;
                cookieChangeDetectionInterval: number;
                tokenValidationInterval: number;
            };
            userprofile: UIServiceConfig;
            feeds: UIServiceConfig & {
                pollInterval: number
            };
        };
        urls: {
            marketing: LinkInfo;
            documentation: LinkInfo;
            statusPage: LinkInfo;
            submitJiraTicket: LinkInfo;
            narrative: LinkInfo;
            loginHelp: LinkInfo;
            narrativeGuide: LinkInfo;
            tutorials: LinkInfo;
            apps: LinkInfo;
            troubleshooting: LinkInfo;
            aboutKBase: LinkInfo;
            contact: LinkInfo;
            help: LinkInfo;
        };
        allow: Array<string>;
        featureSwitches: {
            enabled: Array<string>;
            disabled: Array<string>;
            available: Array<{
                id: string;
                title: string;
                description?: string;
                disabled?: boolean;
            }>;
        };
        constants: {
            clientTimeout: number;
            serviceCheckTimeouts: {
                slow: number;
                hard: number;
            };
        };
        defaults: {
            path: NavigationPath,
        }
    };
    services: {
        Auth2: Auth2ServiceConfig;
        Catalog: CatalogServiceConfig;
        Feeds: FeedsServiceConfig;
        Groups: GroupsServiceConfig;
        NarrativeJobService: NarrativeJobServiceConfig;
        NarrativeMethodStore: NarrativeMethodStoreConfig;
        ORCIDLink: ORCIDLinkServiceConfig;
        UserProfile: UserProfileServiceConfig;
        SampleService: SampleServiceConfig;
        ServiceWizard: ServiceWizardConfig;
        Workspace: WorkspaceServiceConfig;
        RelationEngine: RelationEngineServiceConfig;
        SearchAPI2: SearchAPI2ServiceConfig;
        SearchAPI2Legacy: SearchAPI2LegacyServiceConfig;
        execution_engine2: ExecutionEngineServiceConfig;
    };
    dynamicServices: {
        JobBrowserBFF: DynamicServiceConfig;
        OntologyAPI: DynamicServiceConfig;
        TaxonomyAPI: DynamicServiceConfig;
    };
}

export interface Config extends DeployConfig {
    buildInfo: BuildInfo;
    gitInfo: GitInfo;
    plugins: Array<PluginInfo>;
}
