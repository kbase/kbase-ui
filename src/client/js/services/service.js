/*global define */
/*jslint white: true */
define([
    'promise',
    'require'
], function (Promise, require) {
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
                        console.log('** ERROR ** ');
                        console.log(ex);
                    }
                    return runtime.loadService(serviceConfig.name);

//                    return new Promise(function (resolve) {
//                        require([serviceConfig.module], function (serviceFactory) {
//                            runtime.addService([serviceConfig.name], serviceFactory.make({
//                                runtime: runtime
//                            }));
//                            resolve();
//                        });
//                    });
                });
                return Promise.settle(services);
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