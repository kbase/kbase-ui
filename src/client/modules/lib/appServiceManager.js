define([
    'bluebird'
], function (
    Promise
) {
    'use strict';

    function AppServiceError(type, message, suggestion) {
        this.type = type;
        this.message = message;
        this.suggestion = suggestion;
    }
    AppServiceError.prototype = Object.create(Error.prototype);
    AppServiceError.prototype.constructor = AppServiceError;
    AppServiceError.prototype.name = 'AppServiceError';

    function factory(config) {
        var services = {};
        var moduleBasePath = config.moduleBasePath;

        if (!moduleBasePath) {
            throw new TypeError('moduleBasePath not provided to factory');
        }

        function addService(serviceConfig, serviceDef) {
            services[serviceConfig.name] = {
                name: serviceConfig.name,
                module: serviceConfig.module,
                config: serviceDef
            };
        }

        function loadService(name) {
            return new Promise(function (resolve, reject) {
                var service = services[name],
                    moduleName = [moduleBasePath, service.module].join('/');
                require([moduleName], function (serviceFactory) {
                    var serviceInstance = serviceFactory.make(services[name].config);
                    services[name].instance = serviceInstance;
                    resolve();
                }, function (err) {
                    reject(err);
                });
            });
        }

        function loadServices() {
            var all = Object.keys(services).map(function (name) {
                return loadService(name);
            });
            return Promise.all(all);
        }

        function startServices() {
            var all = Object.keys(services).map(function (name) {
                var service = services[name].instance;
                if (!service) {
                    console.warn('Warning: no service started for ' + name);
                    throw new Error('No service started for ' + name);
                }
                if (!service.start) {
                    console.warn('Warning: no start method for ' + name);
                    return;
                }
                return service.start();
            });
            return Promise.all(all);
        }

        function stopServices() {
            var all = Object.keys(services).map(function (name) {
                var service = services[name];
                if (service && service.instance && service.instance.stop) {
                    return service.instance.stop();
                }
            });
            return Promise.all(all);
        }

        function hasService(name) {
            if (!services[name]) {
                return false;
            }
            return true;
        }

        function getService(name) {
            var service = services[name];
            if (!service) {
                // TODO: throw real exception
                throw new AppServiceError({
                    type: 'UndefinedService',
                    message: 'The requested service "' + name + '" has not been registered',
                    suggestion: 'This is a system configuration issue. The requested service should be installed or the client code programmed to check for its existence first (with hasService)'
                });
            }
            return service.instance;
        }

        function dumpServices() {
            return services;
        }

        return {
            addService: addService,
            getService: getService,
            loadService: loadService,
            hasService: hasService,
            loadServices: loadServices,
            startServices: startServices,
            stopServices: stopServices,
            dumpServices: dumpServices
        };
    }

    return {
        make: factory,
        AppServiceErrror: AppServiceError
    };
});