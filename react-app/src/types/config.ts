import { CookieConfig } from "../lib/kb_lib/Auth2Session";
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

export interface Auth2ServiceConfig extends RestServiceConfig {
  cookieName: string;
  extraCookieNames: Array<CookieConfig>;
  providers: Array<string>;
}

export type CatalogServiceConfig = JSONRPC11ServiceConfig;

export type FeedsServiceConfig = RestServiceConfig;

export type GroupsServiceConfig = RestServiceConfig;

export type RelationEngineServiceConfig = RestServiceConfig;

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
  commitHash: string;
  commitAbbreviatedHash: string;
  authorName: string;
  authorDate: string;
  committerName: string;
  committerDate: string;
  reflogSelector: string;
  subject: string;
  commitNotes: string;
  originUrl: string;
  branch: string;
  tag: string;
  version: string;
}

export type ISODateTimeString = string;

export interface BuildInfo {
  target: string;
  stats: {
    start: number;
  };
  git: GitInfo;
  hostInfo: string | null;
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
  gitInfo: GitInfo;
}

export interface HamburgerMenuDefintion {
    narrative: Menu;
    search: Menu;
    developer: Menu;
    help: Menu;
}

export interface DeployConfig {
  deploy: {
    id: string;
    target: string;
    environment: string;
    hostname: string;
    icon: string;
    name: string;
    ui: {
      origin: string;
    };
    services: {
      urlBase: string;
      dynamicServiceProxies: Array<string>;
    };
  };
  ui: {
    services: {
      connection: UIServiceConfig;
      coreService: UIServiceConfig;
      instrumentation: UIServiceConfig;
      notification: UIServiceConfig;
      session: UIServiceConfig & {
        cookie: {
          maxAge: number;
          name: string;
          backup: {
            name: string;
            domain: string | null;
            enabled: boolean;
          };
        };
        loginWidget: string;
      };
      userprofile: UIServiceConfig;
      feeds: UIServiceConfig;
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
    coreServices: {
      disabled: Array<string>;
    };
    constants: {
      clientTimeout: number;
      serviceCheckTimeouts: {
        slow: number;
        hard: number;
      };
    };
    menus: {
      hamburger: HamburgerMenuDefintion;
      sidebar: Menu;
    };
  };
  services: {
    Auth2: Auth2ServiceConfig;
    Catalog: CatalogServiceConfig;
    Feeds: FeedsServiceConfig;
    Groups: GroupsServiceConfig;
    NarrativeJobService: NarrativeJobServiceConfig;
    NarrativeMethodStore: NarrativeMethodStoreConfig;
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
    SampleService: DynamicServiceConfig;
    OntologyAPI: DynamicServiceConfig;
    TaxonomyAPI: DynamicServiceConfig;
  };
  release: {
    version: string;
  };
}

export interface Config extends DeployConfig {
  build: BuildInfo;
  plugins: Array<PluginInfo>;
}
