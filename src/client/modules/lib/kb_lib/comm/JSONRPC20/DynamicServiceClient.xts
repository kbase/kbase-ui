import { ServiceWizardClient, GetServiceStatusResult } from '../coreServices/ServiceWizard';
import { AuthorizedGenericClient } from './GenericClient';
import Cache from '../Cache';

var moduleCache = new Cache<any>({
    itemLifetime: 1800000,
    monitoringFrequency: 60000,
    waiterTimeout: 30000,
    waiterFrequency: 100
});

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

export interface DynamicServiceClientParams {
    token: string;
    url: string;
    version?: string;
    timeout?: number;
    rpcContext?: any;
    urlBaseOverride?: string;
    urlBase?: string;
}

const DEFAULT_TIMEOUT = 10000;



export class DynamicServiceClient {
    token: string;
    timeout: number;
    rpcContext: any;
    url: string;
    version: string | null;
    urlBaseOverride: string | null;

    static module: string;

    constructor({ token, url, version, timeout, rpcContext, urlBaseOverride }: DynamicServiceClientParams) {
        // Establish an auth object which has properties token and user_id.
        this.token = token;
        this.timeout = timeout || DEFAULT_TIMEOUT;
        this.rpcContext = rpcContext || null;
        this.urlBaseOverride = urlBaseOverride || null;

        if (!url) {
            throw new Error('The service discovery url was not provided');
        }
        this.url = url;

        this.version = version || null;
        if (version === 'auto') {
            this.version = null;
        }
    }

    private options() {
        return {
            timeout: this.timeout,
            authorization: this.token,
            rpcContext: this.rpcContext
        };
    }

    private getModule() {
        return (this.constructor as typeof DynamicServiceClient).module;
    }

    private moduleId() {
        let moduleId;
        if (!this.version) {
            moduleId = this.getModule() + ':auto';
        } else {
            moduleId = this.getModule() + ':' + this.version;
        }
        return moduleId;
    }

    private getCached(fetcher: () => Promise<GetServiceStatusResult>) {
        return moduleCache.getItemWithWait({
            id: this.moduleId(),
            fetcher: fetcher
        });
    }

    // setCached(value: any) {
    //     moduleCache.setItem(this.moduleId(), value);
    // }

    // TODO: Promise<any> -> Promise<ServiceStatusResult>
    private async lookupModule(): Promise<GetServiceStatusResult> {
        return this.getCached(
            (): Promise<GetServiceStatusResult> => {
                const client = new ServiceWizardClient({
                    url: this.url,
                    authorization: this.token,
                    timeout: this.timeout
                });
                // NB wrapped in promise.resolve because the promise we have 
                // here is bluebird, which supports cancellation, which we need.
                return Promise.resolve(
                    client.getServiceStatus({
                        module_name: this.getModule(),
                        version: this.version
                    })
                );
            }
        );
    }

    protected async callFunc<P, T>(funcName: string, params: P): Promise<T> {
        const { url, module_name } = await this.lookupModule();

        const client = new AuthorizedGenericClient({
            module: module_name,
            url,
            token: this.token,
            timeout: this.timeout
        });

        return await client.callFunc<P, T, any>(funcName, params);
    }
}
