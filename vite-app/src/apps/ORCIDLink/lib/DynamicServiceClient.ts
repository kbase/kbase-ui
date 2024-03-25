import Cache from 'lib/kb_lib/comm/Cache';
import {
    ServiceStatus, ServiceWizardClient
} from 'lib/kb_lib/comm/coreServices/ServiceWizard';
import { ServiceClientBase, ServiceClientParams } from './ServiceClient';

const ITEM_LIFETIME = 1800000;
const MONITORING_FREQUENCY = 60000;
const WAITER_TIMEOUT = 30000;
const WAITER_FREQUENCY = 100;

var moduleCache = new Cache<ServiceStatus>({
    itemLifetime: ITEM_LIFETIME,
    monitoringFrequency: MONITORING_FREQUENCY,
    waiterTimeout: WAITER_TIMEOUT,
    waiterFrequency: WAITER_FREQUENCY,
});

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
