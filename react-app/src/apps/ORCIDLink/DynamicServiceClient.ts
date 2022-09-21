import {
    ServiceWizardClient,
    ServiceStatus,
} from 'lib/kb_lib/comm/coreServices/ServiceWizard'
import Cache from 'lib/kb_lib/comm/Cache';
import { JSONValue } from 'lib/json';

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

    protected abstract getUrl(): Promise<string>;

    private async handleResponse<T>(response: Response): Promise<T> {
        if (response.status !== 200) {
            // TODO: real RestException
            throw new Error("Error fetching resource");
        }

        const rawResult = await response.text();
        try {
            const result = JSON.parse(rawResult);
            return result as unknown as T;
        } catch (ex) {
            if (ex instanceof Error) {
                throw new Error('Error parsing JSON: ' + ex.message);
            }
            throw new Error('Error parsing JSON: Unknown Error');
        }
    }

    protected async get<ReturnType>(
        path: string,
    ): Promise<ReturnType> {
        const url = await this.getUrl();

        const headers = new Headers({
            accept: 'application/json'
        });

        if (this.token) {
            headers.append('Authorization', this.token);
        }

        const requestURL = `${url}/${path}`;
        const response = await fetch(requestURL, {
            method: 'GET',
            headers
        });

        return this.handleResponse<ReturnType>(response);
    }

    protected async delete<ReturnType>(
        path: string,
    ): Promise<ReturnType> {
        const url = await this.getUrl();

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

        return this.handleResponse<ReturnType>(response);
    }

    protected async put<ReturnType>(
        path: string,
        data: JSONValue
    ): Promise<ReturnType> {
        const url = await this.getUrl();

        const headers = new Headers({
            'content-type': 'application/json',
            accept: 'application/json'
        });

        if (this.token) {
            headers.append('Authorization', this.token);
        }

        const requestURL = `${url}/${path}`;

        const response = await fetch(requestURL, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });

        return this.handleResponse<ReturnType>(response);
    }

    protected async post<ReturnType>(
        path: string,
        data?: JSONValue
    ): Promise<ReturnType> {
        const url = await this.getUrl();

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
}

export abstract class ServiceClient extends ServiceClientBase {
    async getUrl(): Promise<string> {
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
    protected async getUrl(): Promise<string> {
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
    protected async getUrl(): Promise<string> {
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
