import { tryPromise } from "./kb_lib/Utils";
import { AMDRequire } from "./types";

export class AppServiceError extends Error {
    type: string;
    suggestion: string;
    constructor(
        { type, message, suggestion }: {
            type: string;
            message: string;
            suggestion: string;
        },
    ) {
        super(message);
        this.name = "AppServiceError";
        this.type = type;
        this.suggestion = suggestion;
    }
}

interface Service {
    name: string;
    module: string;
    config: UIServiceDefinition;
    instance: any | null;
}

interface UIServiceConfig {
    name: string;
    module: string;
}

interface UIServiceDefinition {
}

declare var require: AMDRequire;

// function AppServiceError(type, message, suggestion) {
//         this.type = type;
//         this.message = message;
//         this.suggestion = suggestion;
//     }
//     AppServiceError.prototype = Object.create(Error.prototype);
//     AppServiceError.prototype.constructor = AppServiceError;
//     AppServiceError.prototype.name = 'AppServiceError';

export class AppServiceManager {
    moduleBasePath: string;
    services: Map<string, Service>;
    constructor({ moduleBasePath }: { moduleBasePath: string; }) {
        if (!moduleBasePath) {
            throw new TypeError("moduleBasePath not provided");
        }
        this.moduleBasePath = moduleBasePath;
        this.services = new Map();
    }

    addService(serviceConfig: UIServiceConfig, serviceDef: UIServiceDefinition) {
        this.services.set(serviceConfig.name, {
            name: serviceConfig.name,
            module: serviceConfig.module,
            config: serviceDef,
            instance: null,
        });
    }

    loadService(name: string, params: any) {
        return new Promise((resolve, reject) => {
            const service = this.services.get(name);
            if (typeof service === "undefined") {
                throw new Error(`Service ${name} is not defined`);
            }
            const moduleName = [this.moduleBasePath, service.module].join("/");
            require([moduleName], (serviceModule) => {
                var serviceInstance;
                if (serviceModule.ServiceClass) {
                    serviceInstance = new serviceModule.ServiceClass({
                        config: service.config,
                        params,
                    });
                } else {
                    serviceInstance = new serviceModule({
                        config: service.config,
                        params,
                    });
                }
                service.instance = serviceInstance;
                resolve();
            }, (err) => {
                reject(err);
            });
        });
    }

    loadServices(params: any) {
        const allServices = Array.from(this.services.entries()).map(([name]) => {
            return this.loadService(name, params)
                .then((result) => {
                    return result;
                })
                .catch((err) => {
                    console.error("ERROR loading service", name);
                    throw err;
                });
        });
        return Promise.all(allServices);
    }

    startServices(
        options: { except?: Array<string>; only?: Array<string>; } = {},
    ) {
        const allServices = Array.from(this.services.entries())
            .filter(([name, service]) => {
                if (options.except) {
                    return !options.except.includes(name);
                }
                if (options.only) {
                    return options.only.includes(name);
                }
                return true;
            })
            .map(([name, service]) => {
                return tryPromise(() => {
                    if (!service.instance) {
                        console.warn("Warning: no service started for " + name);
                        throw new Error("No service started for " + name);
                    }
                    if (!service.instance.start) {
                        console.warn("Warning: no start method for " + name);
                        return;
                    }
                    return service.instance.start();
                });
            });
        return Promise.all(allServices);
    }

    stopServices() {
        const allServices = Object.keys(this.services).map((name) => {
            var service = this.services.get(name);
            if (service && service.instance && service.instance.stop) {
                return service.instance.stop();
            }
        });
        return Promise.all(allServices);
    }

    hasService(name: string) {
        return this.services.has(name);
    }

    getService(name: string) {
        const service = this.services.get(name);
        if (!service) {
            // TODO: throw real exception
            throw new AppServiceError({
                type: "UndefinedService",
                message: 'The requested service "' + name + '" has not been registered',
                suggestion:
                    "This is a system configuration issue. The requested service should be installed or the client code programmed to check for its existence first (with hasService)",
            });
        }
        return service.instance;
    }
}
