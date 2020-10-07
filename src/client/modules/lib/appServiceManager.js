define([], () => {

    function AppServiceError(type, message, suggestion) {
        this.type = type;
        this.message = message;
        this.suggestion = suggestion;
    }
    AppServiceError.prototype = Object.create(Error.prototype);
    AppServiceError.prototype.constructor = AppServiceError;
    AppServiceError.prototype.name = 'AppServiceError';

    class AppServiceManager {
        constructor({moduleBasePath}) {
            if (!moduleBasePath) {
                throw new TypeError('moduleBasePath not provided');
            }
            this.moduleBasePath = moduleBasePath;
            this.services = {};

        }

        addService(serviceConfig, serviceDef) {
            this.services[serviceConfig.name] = {
                name: serviceConfig.name,
                module: serviceConfig.module,
                config: serviceDef
            };
        }

        loadService(name, params) {
            return new Promise((resolve, reject) => {
                var service = this.services[name],
                    moduleName = [this.moduleBasePath, service.module].join('/');
                require([moduleName], (serviceModule) => {
                    var serviceInstance;
                    if (serviceModule.ServiceClass) {
                        serviceInstance = new serviceModule.ServiceClass({
                            config: this.services[name].config,
                            params
                        });
                    } else {
                        serviceInstance = new serviceModule({
                            config: this.services[name].config,
                            params
                        });
                    }
                    service.instance = serviceInstance;
                    resolve();
                }, (err) => {
                    reject(err);
                });
            });
        }

        loadServices(params) {
            const allServices = Object.keys(this.services).map((name) => {
                return this.loadService(name, params)
                    .then((result) => {
                        return result;
                    })
                    .catch((err) => {
                        console.error('ERROR loading service', name);
                        throw err;
                    });
            });
            return Promise.all(allServices);
        }

        startServices() {
            const allServices = Object.keys(this.services).map((name) => {
                const service = this.services[name].instance;
                if (!service) {
                    console.warn('Warning: no service started for ' + name);
                    throw new Error('No service started for ' + name);
                }
                if (!service.start) {
                    console.warn('Warning: no start method for ' + name);
                    return;
                }
                return service.start()
                    .then((result) => {
                        return result;
                    });
            });
            return Promise.all(allServices);
        }

        stopServices() {
            const allServices = Object.keys(this.services).map((name) => {
                var service = this.services[name];
                if (service && service.instance && service.instance.stop) {
                    return service.instance.stop();
                }
            });
            return Promise.all(allServices);
        }

        hasService(name) {
            if (!this.services[name]) {
                return false;
            }
            return true;
        }

        getService(name) {
            const service = this.services[name];
            if (!service) {
                // TODO: throw real exception
                throw new AppServiceError({
                    type: 'UndefinedService',
                    message: 'The requested service "' + name + '" has not been registered',
                    suggestion:
                        'This is a system configuration issue. The requested service should be installed or the client code programmed to check for its existence first (with hasService)'
                });
            }
            return service.instance;
        }

        dumpServices() {
            return this.services;
        }
    }
    return AppServiceManager;
});
