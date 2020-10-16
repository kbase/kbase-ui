import { ServiceClient } from '../JSONRPC11/ServiceClient';

// types from module

export interface Service {
    module_name: string;
    version: string | null;
}

export interface ServiceStatus {
    module_name: string;
    version: string;
    git_commit_hash: string;
    release_tags: Array<string>;
    hash: string;
    url: string;
    up: number; // aka boolean
    status: string;
    health: string;
}

function isString(x: any, p: string): boolean {
    if (typeof x === 'object' && Reflect.has(x, p)) {
        if (typeof ((Reflect.get(x, p) as unknown) as any) === 'string') {
            return true;
        }
    }
    return false;
}

function isNumber(x: any, p: string): boolean {
    if (typeof x === 'object' && Reflect.has(x, p)) {
        if (typeof ((Reflect.get(x, p) as unknown) as any) === 'number') {
            return true;
        }
    }
    return false;
}

function isArray(x: any, p: string, subType: string): boolean {
    if (typeof x === 'object' && Reflect.has(x, p)) {
        const value = Reflect.get(x, p) as unknown;
        if (typeof value === 'object' && value instanceof Array) {
            if (value.length === 0) {
                return true;
            }
            return value.every((arrayElement: unknown) => {
                return typeof arrayElement === 'string';
            });
        }
    }
    return false;
}

function isGetServiceStatusResult(x: any): x is GetServiceStatusResult {
    if (
        isString(x, 'module_name') &&
        isString(x, 'version') &&
        isString(x, 'git_commit_hash') &&
        isArray(x, 'release_tags', 'string') &&
        isString(x, 'url') &&
        isNumber(x, 'up') &&
        isString(x, 'status') &&
        isString(x, 'health')
    ) {
        return true;
    }
    return false;
}

// impl

/**
 * Params structure for client constructor
 */
// export interface ServiceWizardClientParams extends JSONRPCClientParams { }

/**
 * Params (input) structure for the get_service_status call
 */
export interface GetServiceStatusParams extends Service { }

/**
 * Result (output) structure for the get_service_status call.
 */
export interface GetServiceStatusResult extends ServiceStatus { }

/**
 * The service wizard client.
 */
export class ServiceWizardClient extends ServiceClient {
    module: string = 'ServiceWizard';

    // constructor(params: ServiceWizardClientParams) {
    //     super(params);
    // }

    async getServiceStatus(params: GetServiceStatusParams): Promise<GetServiceStatusResult> {
        const result = await this.callFunc<GetServiceStatusParams, GetServiceStatusResult>('get_service_status', params);

        if (!result) {
            throw new Error('Crazy as it seems, result is falsy');
        }
        if (isGetServiceStatusResult(result)) {
            return result;
        } else {
            throw new Error('Sorry, result does not conform to "GetServiceStatusResult"');
        }
    }
}
