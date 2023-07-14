export interface ServiceDescriptionBase {
    title: string;
    type: 'rest' | 'jsonrpc11' | 'jsonrpc20';
    module: string;
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
        versionKey: 'version',
    },
    {
        title: 'Catalog',
        module: 'Catalog',
        type: 'jsonrpc11',
        method: 'version',
    },
    {
        title: 'Execution Engine 2',
        type: 'jsonrpc11',
        module: 'execution_engine2',
        method: 'ver',
    },
    {
        title: 'Feeds',
        type: 'rest',
        module: 'Feeds',
        path: '/',
        versionKey: 'version',
    },
    {
        title: 'Groups',
        type: 'rest',
        module: 'Groups',
        path: '/',
        versionKey: 'version',
    },
    {
        title: 'Sample Service',
        module: 'SampleService',
        type: 'jsonrpc11',
        method: 'status',
        versionKey: 'version',
    },
    {
        title: 'Search2',
        module: 'SearchAPI2',
        type: 'jsonrpc20',
        method: 'rpc.discover',
        versionKey: 'service_info.version',
    },
    {
        title: 'Service Wizard',
        module: 'ServiceWizard',
        type: 'jsonrpc11',
        method: 'version',
    },
    {
        title: 'User Profile',
        module: 'UserProfile',
        type: 'jsonrpc11',
        method: 'ver',
    },
    {
        title: 'Workspace',
        module: 'Workspace',
        type: 'jsonrpc11',
        method: 'ver',
    },
];
