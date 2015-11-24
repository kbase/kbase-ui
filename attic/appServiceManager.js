/*global define, require */
/*jslint white: true*/
define([
    'bluebird'
], function (Promise) {
    'use strict';

    function factory(config) {
        var services = {};
        function addService(serviceName, serviceDef) {
            services[serviceName] = {
                config: serviceDef
            };
        }
        function loadService(name) {
            return new Promise(function (resolve, reject) {
                var service = services[name],
                    moduleName = service.config.module;
                if (!moduleName) {
                    moduleName = 'kb_appServices_' + name;
                    var paths = {},
                        path = services[name].config.path || 'app/services/' + name;
                    paths[moduleName] = path;
                    require.config({
                        paths: paths
                    });
                } else {
                    console.log('appServiceManager: have a module already.');
                    console.log(moduleName);
                }
                require([moduleName], function (serviceFactory) {
                    var serviceInstance = serviceFactory.make(services[name].config);
                    services[name].instance = serviceInstance;
                    resolve();
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
                return Promise.try(function () {
                    var service = services[name].instance;
                    if (!service) {
                        console.log('Warning: no service started for ' + name);
                        throw new Error('No service started for ' + name);
                    }
                    if (!service.start) {
                        console.log('Warning: no start method for ' + name);
                        return;
                    }
                    return Promise.try(function () {
                        return service.start();
                    })
                })
                    .catch(function (err) {
                        console.error('Error starting service ' + name);
                        console.error('err');
                        reject(err);
                    });

            });
            return Promise.all(all);
        }
        function stopServices() {
            var all = Object.keys(services).map(function (name) {
                return new Promise(function (resolve, reject) {
                    var service = services[name];
                    if (service && service.instance && service.instance.stop) {
                        return service.instance.stop()
                            .then(function () {
                                resolve();
                            });
                    }
                });
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
                throw {
                    name: 'UndefinedService',
                    message: 'The requested service "' + name + '" has not been registered.',
                    suggestion: 'This is a system configuration issue. The requested service should be installed or the client code programmed to check for its existence first (with hasService)'
                };
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
        make: function (config) {
            return factory(config);
        }
    };
});