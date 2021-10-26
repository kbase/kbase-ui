import {
    ServiceWizardClient,
    ServiceStatus,
} from '../coreServices/ServiceWizard';
import { ServiceClient, ServiceClientParams } from './ServiceClient';
import Cache from '../Cache';

import { JSONRPCParams } from './JSONRPC20';
import { JSONValue } from '@kbase/ui-lib/lib/json';

const ITEM_LIFETIME = 1800000;
const MONITORING_FREQUENCY = 60000;
const WAITER_TIMEOUT = 30000;
const WAITER_FREQUENCY = 100;

const moduleCache = new Cache<ServiceStatus>({
    itemLifetime: ITEM_LIFETIME,
    monitoringFrequency: MONITORING_FREQUENCY,
    waiterTimeout: WAITER_TIMEOUT,
    waiterFrequency: WAITER_FREQUENCY,
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

export interface DynamicServiceClientParams extends ServiceClientParams {
    version?: string;
}

export abstract class DynamicServiceClient extends ServiceClient {
    version: string | null;

    abstract module: string;

    serviceDiscoveryURL: string;
    serviceDiscoveryModule: string = 'ServiceWizard';

    protected constructor(params: DynamicServiceClientParams) {
        super(params);
        const { version } = params;

        this.version = version || null;
        if (this.version === 'auto') {
            this.version = null;
        }

        this.serviceDiscoveryURL = params.url;
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
    private async lookupModule(): Promise<ServiceStatus> {
        const moduleInfo = await this.getCached(
            async (): Promise<ServiceStatus> => {
                const client = new ServiceWizardClient({
                    url: this.serviceDiscoveryURL!,
                    token: this.token,
                    timeout: this.timeout,
                });
                // NB wrapped in promise.resolve because the promise we have
                // here is bluebird, which supports cancellation, which we need.
                return await client.get_service_status({
                    module_name: this.module,
                    version: this.version,
                });
            }
        );
        this.module = moduleInfo.module_name;
        this.url = moduleInfo.url;
        return moduleInfo;
    }

    async callFunc(
        funcName: string,
        params: JSONRPCParams
    ): Promise<JSONValue> {
        await this.lookupModule();
        return super.callFunc(funcName, params);
    }
}
