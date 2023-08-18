export interface ServiceDescriptionBase {
    title: string;
    type: 'rest' | 'jsonrpc11' | 'jsonrpc20';
    module: string;
    repoURL: string;
    versionKey?: string;
}

export interface ServiceDescriptionRest extends ServiceDescriptionBase {
    type: 'rest';
    path: string;
}

export interface ServiceDescriptionJSONRPC11 extends ServiceDescriptionBase {
    type: 'jsonrpc11';
    method: string;
}

export interface ServiceDescriptionJSONRPC20 extends ServiceDescriptionBase {
    type: 'jsonrpc20';
    method: string;
}

export type ServiceDescription =
    | ServiceDescriptionRest
    | ServiceDescriptionJSONRPC11
    | ServiceDescriptionJSONRPC20;

export const SERVICES: Array<ServiceDescription> = [
    {
        title: 'Auth',
        type: 'rest',
        module: 'Auth2',
        path: '/',
        repoURL: "https://github.com/kbase/auth2",
        versionKey: 'version',
    },
    {
        title: 'Catalog',
        module: 'Catalog',
        type: 'jsonrpc11',
        repoURL: "https://github.com/kbase/catalog",
        method: 'version',
    },
    {
        title: 'Execution Engine 2',
        type: 'jsonrpc11',
        module: 'execution_engine2',
        repoURL: 'https://github.com/kbase/execution_engine2',
        method: 'ver',
    },
    {
        title: 'Feeds',
        type: 'rest',
        module: 'Feeds',
        path: '/',
        repoURL: 'https://github.com/kbase/feeds',
        versionKey: 'version',
    },
    {
        title: 'Groups',
        type: 'rest',
        module: 'Groups',
        path: '/',
        repoURL: 'https://github.com/kbase/groups',
        versionKey: 'version',
    },
    {
        title: 'Sample Service',
        module: 'SampleService',
        type: 'jsonrpc11',
        method: 'status',
        repoURL: 'https://github.com/kbase/sample_service',
        versionKey: 'version',
    },
    {
        title: 'Search2',
        module: 'SearchAPI2',
        type: 'jsonrpc20',
        method: 'rpc.discover',
        repoURL: 'https://github.com/kbase/search',
        versionKey: 'service_info.version',
    },
    {
        title: 'Service Wizard',
        module: 'ServiceWizard',
        type: 'jsonrpc11',
        repoURL: 'https://github.com/kbase/service_wizard',
        method: 'version',
    },
    {
        title: 'User Profile',
        module: 'UserProfile',
        type: 'jsonrpc11',
        repoURL: 'https://github.com/kbase/user_profile',
        method: 'ver',
    },
    {
        title: 'Workspace',
        module: 'Workspace',
        type: 'jsonrpc11',
        repoURL: 'https://github.com/kbase/workspace_deluxe',
        method: 'ver',
    },
];
