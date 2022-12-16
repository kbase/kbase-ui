import { JSONObject, JSONValue } from 'lib/json';
import Cache from 'lib/kb_lib/comm/Cache';
import {
    ServiceStatus, ServiceWizardClient
} from 'lib/kb_lib/comm/coreServices/ServiceWizard';
import { toJSON } from 'lib/kb_lib/jsonLike';

const ITEM_LIFETIME = 1800000;
const MONITORING_FREQUENCY = 60000;
const WAITER_TIMEOUT = 30000;
const WAITER_FREQUENCY = 100;

// now import the service wizard, and one auth generic client

// type Promise<T> = Promise<T>

// interface ModuleInfo {

//     module_name: string;
// }

var moduleCache = new Cache<ServiceStatus>({
    itemLifetime: ITEM_LIFETIME,
    monitoringFrequency: MONITORING_FREQUENCY,
    waiterTimeout: WAITER_TIMEOUT,
    waiterFrequency: WAITER_FREQUENCY,
});

export interface ServiceClientParams {
    url: string;
    timeout: number;
    token?: string;
}

export interface SearchParams {
    [key: string]: string
}

export type SearchParams2 = Array<[string, string]>

/*
 * arg is:
 * url - service wizard url
 * timeout - request timeout
 * version - service release version or tag
 * auth - auth structure
 *   token - auth token
 *   username - username
 * rpcContext
 */

export interface ServiceErrorResponse {
    code: string,
    title?: string,
    message: string,
    data?: JSONObject
}

// export interface FastAPIErrorResponse extends ServiceErrorResponse {
//     data: {
//         'response-code': number,
//         'developer-message': string,
//         'user-message': string,
//         'error-code': number,
//         'more-info': string
//     };
// }

// export interface InternalServerErrorResponse extends ServiceErrorResponse {
// }

// export intr

// export class FastAPIError extends Error {
//     data: FastAPIErrorResponse;
//     constructor(message: string, data: FastAPIErrorResponse) {
//         super(message);
//         this.data = data;
//     }
// }

export class ServiceError extends Error {
    code: string;
    title?: string;
    data?: JSONObject;
    constructor(response: ServiceErrorResponse) {
        super(response.message);
        this.title = response.title;
        this.code = response.code;
        this.data = response.data;
    }
}

export class InternalServerError extends ServiceError {

}

export class ClientError extends ServiceError {

}


export abstract class ServiceClientBase {
    url: string;
    timeout: number;
    token?: string;

    abstract module: string;

    constructor(params: ServiceClientParams) {
        this.url = params.url;
        this.token = params.token;
        this.timeout = params.timeout;
    }

    protected abstract getURL(): Promise<string>;

    private async handleResponse<T>(response: Response): Promise<T> {
        const rawResult = await response.text();
        const result = (() => {
            try {
                // TODO: align this with how we are designing the ORCID Link Service
                // The response can either be:
                // 200 with the expected JSON value
                // 4xx with the JSON response: code, message, data?
                // 500 with the JSON response: code, message, data, where
                // data contains at least exception, traceback
                // It should always contain a JSON response.
                return JSON.parse(rawResult);
            } catch (ex) {
                if (ex instanceof Error) {
                    throw new Error('Error parsing JSON: ' + ex.message);
                }
                throw new Error('Error parsing JSON: Unknown Error');
            }
        })();

        if (response.status === 500) {
            const errorResult = result as unknown as ServiceErrorResponse;
            throw new InternalServerError(errorResult);
        } else if (response.status >= 400) {
            // TODO: real RestException
            const errorResult = result as unknown as ServiceErrorResponse;
            throw new ClientError(errorResult);
        }

        return result as unknown as T;
    }

    private async handleEmptyResponse(response: Response): Promise<void> {
        // const rawResult = await response.text();
        // const result = (() => {
        //     try {
        //         // TODO: align this with how we are designing the ORCID Link Service
        //         // The response can either be:
        //         // 200 with the expected JSON value
        //         // 4xx with the JSON response: code, message, data?
        //         // 500 with the JSON response: code, message, data, where
        //         // data contains at least exception, traceback
        //         // It should always contain a JSON response.
        //         return JSON.parse(rawResult);
        //     } catch (ex) {
        //         if (ex instanceof Error) {
        //             throw new Error('Error parsing JSON: ' + ex.message);
        //         }
        //         throw new Error('Error parsing JSON: Unknown Error');
        //     }
        // })();

        if (response.status !== 204) {
            const result = await response.json();
            if (response.status === 500) {
                const errorResult = result as unknown as ServiceErrorResponse;
                throw new InternalServerError(errorResult);
            } else if (response.status >= 400) {
                // TODO: real RestException
                const errorResult = result as unknown as ServiceErrorResponse;
                throw new ClientError(errorResult);
            }
        }
    }

    protected async get<ReturnType>(
        path: string,
        data?: SearchParams
    ): Promise<ReturnType> {
        const url = await this.getURL();

        const headers = new Headers({
            accept: 'application/json'
        });

        if (this.token) {
            headers.append('Authorization', this.token);
        }

        const requestURL = (() => {
            const theURL = new URL(`${url}/${path}`);
            if (data) {
                for (const [key, value] of Object.entries(data)) {
                    theURL.searchParams.set(key, value);
                }
            }
            return theURL;
        })();

        const response = await fetch(requestURL.toString(), {
            method: 'GET',
            headers
        });

        return this.handleResponse<ReturnType>(response);
    }

    protected async get2<ReturnType>(
        path: string,
        data?: SearchParams2
    ): Promise<ReturnType> {
        const url = await this.getURL();

        const headers = new Headers({
            accept: 'application/json'
        });

        if (this.token) {
            headers.append('Authorization', this.token);
        }

        const requestURL = (() => {
            const theURL = new URL(`${url}/${path}`);
            if (data) {
                for (const [key, value] of data) {
                    theURL.searchParams.append(key, value);
                }
            }
            return theURL;
        })();

        // const requestURL = `${url}/${path}`;
        const response = await fetch(requestURL.toString(), {
            method: 'GET',
            headers
        });

        return this.handleResponse<ReturnType>(response);
    }

    protected async delete(
        path: string,
    ): Promise<void> {
        const url = await this.getURL();

        const headers = new Headers({
            accept: 'application/json'
        });

        if (this.token) {
            headers.append('Authorization', this.token);
        }

        const requestURL = `${url}/${path}`;
        const response = await fetch(requestURL, {
            method: 'DELETE',
            headers
        });

        // TODO: check response status code. Should be 204, otherwise throw error.

        return this.handleEmptyResponse(response);
    }

    protected async put<ReturnType>(
        path: string,
        data?: JSONValue
    ): Promise<ReturnType> {
        const url = await this.getURL();

        const headers = new Headers({
            'content-type': 'application/json',
            accept: 'application/json'
        });

        if (this.token) {
            headers.append('Authorization', this.token);
        }

        const requestURL = `${url}/${path}`;

        const options: RequestInit = {
            method: 'PUT',
            headers
        };
        if (typeof data !== 'undefined') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(requestURL, options);

        return this.handleResponse<ReturnType>(response);
    }

    protected async post<ReturnType>(
        path: string,
        data?: JSONValue
    ): Promise<ReturnType> {
        const url = await this.getURL();

        const headers = new Headers({
            'content-type': 'application/json',
            accept: 'application/json'
        });

        if (this.token) {
            headers.append('Authorization', this.token);
        }

        const requestURL = `${url}/${path}`;

        const options: RequestInit = {
            method: 'POST',
            headers
        };
        if (typeof data !== 'undefined') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(requestURL, options);

        return this.handleResponse<ReturnType>(response);
    }

    protected async post2<ParamType, ReturnType>(
        path: string,
        data?: ParamType
    ): Promise<ReturnType> {
        const url = await this.getURL();

        const headers = new Headers({
            'content-type': 'application/json',
            accept: 'application/json'
        });

        if (this.token) {
            headers.append('Authorization', this.token);
        }

        const requestURL = `${url}/${path}`;

        const options: RequestInit = {
            method: 'POST',
            headers
        };
        if (typeof data !== 'undefined') {
            options.body = JSON.stringify(toJSON(data));
        }

        const response = await fetch(requestURL, options);

        return this.handleResponse<ReturnType>(response);
    }
}


export abstract class ServiceClient extends ServiceClientBase {
    async getURL(): Promise<string> {
        return this.url;
    }
}


export interface DynamicServiceClientParams extends ServiceClientParams {
    version?: string;
    // module: string;
}

export abstract class DynamicServiceClient extends ServiceClientBase {
    serviceDiscoveryModule: string = 'ServiceWizard';
    version: string | null;

    constructor(params: DynamicServiceClientParams) {
        super(params);
        const { version } = params;

        this.version = version || null;
        if (this.version === 'auto') {
            this.version = null;
        }
    }

    private moduleId() {
        let moduleId;
        if (!this.version) {
            moduleId = this.module + ':auto';
        } else {
            moduleId = this.module + ':' + this.version;
        }
        return moduleId;
    }

    private getCached(fetcher: () => Promise<ServiceStatus>) {
        return moduleCache.getItemWithWait({
            id: this.moduleId(),
            fetcher: fetcher,
        });
    }

    // setCached(value: any) {
    //     moduleCache.setItem(this.moduleId(), value);
    // }

    // TODO: Promise<any> -> Promise<ServiceStatusResult>
    protected async getURL(): Promise<string> {
        const moduleInfo = await this.getCached(
            async (): Promise<ServiceStatus> => {
                const client = new ServiceWizardClient({
                    url: this.url,
                    token: this.token,
                    timeout: this.timeout,
                });
                // NB wrapped in promise.resolve because the promise we have
                // here is bluebird, which supports cancellation, which we need.
                const status = await client.get_service_status({
                    module_name: this.module,
                    version: this.version,
                });
                return status;
            }
        );
        return moduleInfo.url;
    }
}

export interface MultiServiceClientParams extends ServiceClientParams {
    version?: string;
    isDynamicService: boolean;
}

// export enum ServiceClientType {
//     CORE = "CORE",
//     DYNAMIC="DYNAMIC"
// }

// export interface ServiceClientParamsBase {
//     type: ServiceClientType
// }

// export interface ServiceClientCoreParams extends ServiceClientBase {
//     type: ServiceClientType.CORE
// }

// export interface ServiceClientDynamicParams extends ServiceClientBase {
//     type: ServiceClientType.DYNAMIC;
//     version: string | null;
// }

// export type MultiServiceClientParams = ServiceClientCoreParams | ServiceClientDynamicParams;

// export function getServiceClient(params: MultiServiceClientParams): ServiceClient {
//     switch (params.type) {
//         case ServiceClientType.CORE:
//             return new ServiceClient(params);
//     }
// }


export abstract class MultiServiceClient extends ServiceClientBase {
    serviceDiscoveryModule: string = 'ServiceWizard';
    version: string | null;
    isDynamicService: boolean;

    constructor(params: MultiServiceClientParams) {
        super(params);
        const { version, isDynamicService } = params;
        this.isDynamicService = isDynamicService;

        this.version = version || null;
        if (this.version === 'auto') {
            this.version = null;
        }
    }

    private moduleId() {
        let moduleId;
        if (!this.version) {
            moduleId = this.module + ':auto';
        } else {
            moduleId = this.module + ':' + this.version;
        }
        return moduleId;
    }

    private getCached(fetcher: () => Promise<ServiceStatus>) {
        return moduleCache.getItemWithWait({
            id: this.moduleId(),
            fetcher: fetcher,
        });
    }

    // setCached(value: any) {
    //     moduleCache.setItem(this.moduleId(), value);
    // }

    // TODO: Promise<any> -> Promise<ServiceStatusResult>
    async getURL(): Promise<string> {
        if (this.isDynamicService) {
            const moduleInfo = await this.getCached(
                async (): Promise<ServiceStatus> => {
                    const client = new ServiceWizardClient({
                        url: this.url,
                        token: this.token,
                        timeout: this.timeout,
                    });
                    // NB wrapped in promise.resolve because the promise we have
                    // here is bluebird, which supports cancellation, which we need.
                    const status = await client.get_service_status({
                        module_name: this.module,
                        version: this.version,
                    });
                    return status;
                }
            );
            return moduleInfo.url;
        }
        return this.url;
    }
}
