define([
    'bluebird'
], function (
    Promise
) {
    'use strict';

    return class Service {
        constructor({runtime}) {
            this.runtime = runtime;
        }

        pluginHandler(serviceConfigs) {
            return Promise.try(() => {
                const services = serviceConfigs.map((serviceConfig) => {
                    try {
                        this.runtime.addService(serviceConfig.name, {
                            runtime: this.runtime,
                            module: serviceConfig.module
                        });
                    } catch (ex) {
                        console.error('** ERROR ** ');
                        console.error(ex);
                    }
                    return this.runtime.loadService(serviceConfig.name);
                });
                return Promise.all(services);
            });
        }

        start() {
            return true;
        }

        stop() {
            return true;
        }
    };
});