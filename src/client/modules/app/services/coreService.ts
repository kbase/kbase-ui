
import { Runtime } from '../../lib/types';

interface CoreServicesMonitorParams {
    params: {
        runtime: Runtime;
    };
}
export class CoreServicesMonitor {
    runtime: Runtime;
    constructor({ params: { runtime } }: CoreServicesMonitorParams) {
        this.runtime = runtime;
    }

    start() {
        return Promise.resolve();
    }

    stop() {
        return Promise.resolve();
    }

    pluginHandler() {
    }

    addCoreServiceDependency() {
    }
}

export const ServiceClass = CoreServicesMonitor;
