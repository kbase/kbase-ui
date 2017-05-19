define([
    'promise'
], function (
    Promise
) {
    'use strict';

    function factory(config) {
        var runtime = config.runtime;

        function pluginHandler(serviceConfigs) {
            return Promise.try(function () {
                var services = serviceConfigs.map(function (serviceConfig) {
                    try {
                        runtime.addService(serviceConfig.name, {
                            runtime: runtime,
                            module: serviceConfig.module
                        });
                    } catch (ex) {
                        console.error('** ERROR ** ');
                        console.error(ex);
                    }
                    return runtime.loadService(serviceConfig.name);
                });
                return Promise.all(services);
            });
        }

        function start() {
            return true;
        }

        function stop() {
            return true;
        }

        return {
            pluginHandler: pluginHandler,
            start: start,
            stop: stop
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});