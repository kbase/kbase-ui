define([
    'require',
    'promise'
], function (
    require,
    Promise
) {
    'use strict';

    function factory(config) {
        var runtime = config.runtime;
        var components = {};

        function start() {
            return true;
        }

        function stop() {
            return true;
        }

        function pluginHandler(serviceConfig, pluginConfig) {
            return Promise.try(function () {

                return Promise.all(serviceConfig.map(function (componentConfig) {
                    // keep a map of loaded components
                    if (components[componentConfig.name]) {
                        throw new Error('Component already loaded "' + componentConfig.name);
                    }

                    // simply require the module to register the component, or components.
                    // oops, that would break the model...

                    return new Promise(function (resolve, reject) {
                        var modulePaths = [];
                        modulePaths.push([pluginConfig.moduleRoot, componentConfig.module].join('/'));
                        if (componentConfig.css) {
                            modulePaths.push('css!' + [pluginConfig.moduleRoot, componentConfig.module].join('/'));
                        }
                        require(modulePaths, function (result) {
                            resolve(result);
                        }, function (err) {
                            reject(err);
                        });
                    });
                }));
            });
        }
        return {
            // lifecycle interface
            start: start,
            stop: stop,
            // plugin interface
            pluginHandler: pluginHandler
        };
    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
});
