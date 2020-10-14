/* global define */
// Note that we use the global require here because we need to
// update the global confirmation.
// const prequire = Promise.promisify(window.require);
define(["require", "exports", "./kb_lib/Utils"], function (require, exports, Utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PluginManager = void 0;
    function prequire(dependencies) {
        return new Promise(function (resolve, reject) {
            try {
                require(dependencies, function (result) {
                    resolve(result);
                }, function (error) {
                    reject(error);
                });
            }
            catch (ex) {
                reject(ex);
            }
        });
    }
    var PluginManager = /** @class */ (function () {
        function PluginManager(_a) {
            var runtime = _a.runtime, moduleBase = _a.moduleBase;
            this.runtime = runtime;
            this.moduleBase = moduleBase || '/modules';
            this.services = new Map();
        }
        /*
         * All of these installXXX installers return an array of
         * promises.
         */
        PluginManager.prototype.registerService = function (serviceNames, serviceDef) {
            var _this = this;
            // TODO: transform service definition to service 
            var service = serviceDef;
            serviceNames.forEach(function (name) {
                _this.services.set(name, service);
            });
        };
        PluginManager.prototype.installIntoService = function (pluralTypeName, serviceDefinition, pluginConfig, pluginDef) {
            var _this = this;
            return Utils_1.tryPromise(function () {
                // weird, perhaps, way to strip off a terminal "s".
                var nameMatch = pluralTypeName.match(/(.*?)(:?(s)|($))$/);
                if (!nameMatch) {
                    return;
                }
                var typeName = nameMatch[1];
                if (!_this.runtime.hasService(typeName)) {
                    console.error('missing service', typeName, serviceDefinition, pluginConfig);
                    throw {
                        name: 'MissingService',
                        message: 'The requested service "' + typeName + '" was not registered in the plugin manager',
                        suggestion: 'This is a web app configuration issue, not a user error'
                    };
                }
                // NB to avoid an empty call to installIntoService, just omit the
                // service from the install section.
                if (serviceDefinition) {
                    var service = _this.runtime.getService(typeName);
                    if (service.pluginHandler) {
                        return service.pluginHandler(serviceDefinition, pluginConfig, pluginDef);
                    }
                }
            });
        };
        PluginManager.prototype.installLegacyPlugin = function (pluginLocation, pluginDef) {
            var _this = this;
            // build up a list of modules and add them to the require config.
            return Utils_1.tryPromise(function () {
                var paths = new Map();
                var shims = new Map();
                var sourcePath = pluginLocation.directory;
                var dependencies = [];
                var usingSourceModules = false;
                // load any styles.
                // NB these are styles for the plugin as a whole.
                // This usage of require.config will merge with the existing
                // require configuration.
                // require.config({ paths: paths, shim: shims });
                // Create a dynamic module for the plugin to use. The current use
                // case is for code within the plugin to have access to the path
                // to the plugin for loading other files.
                //
                // NB: this implies that the plugin package name is unique in
                // the system. To enforce or at least help developers with this
                // we should have a plugin registry.
                // define('kb_plugin_' + pluginDef.package.name, [], () => {
                //     return {
                //         plugin: {
                //             name: pluginDef.package.name,
                //             resources: {
                //                 // to be used for module loading, e.g. yaml, json,
                //                 // css through requirejs
                //                 modulePath: '/' + sourcePath + '/resources',
                //                 // to be used for document references, e.g. img, css doc
                //                 documentPath: this.moduleBase + '/' + sourcePath + '/resources'
                //             },
                //             path: '/' + sourcePath + '/resources',
                //             modulePath: '/' + sourcePath + '/resources',
                //             fullPath: this.moduleBase + '/' + sourcePath + '/resources'
                //         }
                //     };
                // });
                var pluginConfig = {
                    usingSourceModules: usingSourceModules,
                    root: sourcePath,
                    moduleRoot: sourcePath + '/modules',
                    resourcesRoot: _this.moduleBase + '/' + sourcePath + '/resources'
                };
                // Now install any ui service configuration.
                var serviceConfigs = pluginDef.services || pluginDef.install;
                if (serviceConfigs) {
                    return prequire(dependencies)
                        .then(function () {
                        var installSteps = [];
                        Object.keys(serviceConfigs).forEach(function (serviceName) {
                            var installDef = serviceConfigs[serviceName];
                            var installationPromise = _this.installIntoService(serviceName, installDef, pluginConfig, pluginDef);
                            if (installationPromise) {
                                installSteps.push(installationPromise);
                            }
                        });
                        // Do all of the install steps.
                        return Promise.all(installSteps);
                    });
                }
                else {
                    return null;
                }
            });
        };
        PluginManager.prototype.installIFramePlugin = function (pluginLocation, pluginDef, options) {
            var _this = this;
            // build up a list of modules and add them to the require config.
            return Promise.try(function () {
                var sourcePath = pluginLocation.directory;
                var dependencies = [];
                var usingSourceModules = false;
                var pluginConfig = {
                    usingSourceModules: usingSourceModules,
                    root: sourcePath,
                    iframePath: sourcePath + '/iframe_root/index.html'
                };
                // hmm, hack this... for now ...
                pluginDef.package.name = options.pluginName;
                // Now install any ui service configuration.
                var serviceConfigs = pluginDef.services || pluginDef.install;
                if (serviceConfigs) {
                    return prequire(dependencies).then(function () {
                        var installSteps = Array();
                        Object.keys(serviceConfigs).forEach(function (serviceName) {
                            var installDef = serviceConfigs[serviceName];
                            var installationPromise = _this.installIntoService(serviceName, installDef, pluginConfig, pluginDef);
                            if (installationPromise) {
                                installSteps.push(installationPromise);
                            }
                        });
                        // Do all of the install steps.
                        return Promise.all(installSteps);
                    });
                }
                else {
                    return null;
                }
            });
        };
        PluginManager.prototype.installPlugin = function (pluginLocation, pluginDef, options) {
            var _this = this;
            // build up a list of modules and add them to the require config.
            return Promise.try(function () {
                // Plugin type - legacy or iframe.
                var pluginType = pluginDef.package.type || 'iframe';
                switch (pluginType) {
                    case 'legacy':
                        return _this.installLegacyPlugin(pluginLocation, pluginDef);
                    case 'iframe':
                        return _this.installIFramePlugin(pluginLocation, pluginDef, options);
                    default:
                        throw new Error('Unsupported plugin type: ' + pluginType);
                }
            });
        };
        PluginManager.prototype.makePromiseIterator = function (actions) {
            return new Promise(function (topResolve, topReject) {
                function promiseIterator(actions) {
                    if (actions === undefined || actions.length === 0) {
                        topResolve('DONE');
                    }
                    var next = actions[0];
                    var rest = actions.slice(1);
                    Promise.try(function () {
                        return new Promise(function (resolve, reject, notify) {
                            next(resolve, reject, notify);
                        });
                    })
                        .then(function () {
                        return promiseIterator(rest);
                    })
                        .catch(function (err) {
                        topReject(err);
                    });
                }
                promiseIterator(actions);
            });
        };
        /**
         *
         * @param {type} pluginDef
         * @returns {Promise}
         */
        PluginManager.prototype.loadPlugin = function (pluginDef, options) {
            var _this = this;
            if (pluginDef.disabled) {
                return;
            }
            return new Promise(function (resolve, reject) {
                require(['yaml!' + pluginDef.directory + '/config.yml'], function (pluginConfig) {
                    _this.installPlugin(pluginDef, pluginConfig, options)
                        .then(function () {
                        resolve(pluginDef);
                    })
                        .catch(function (err) {
                        reject(err);
                    });
                });
            });
        };
        PluginManager.prototype.installPlugins = function (pluginDefs) {
            var _this = this;
            var loaders = Object.keys(pluginDefs).map(function (pluginName) {
                return _this.loadPlugin(pluginDefs[pluginName], { pluginName: pluginName });
            });
            return Promise.all(loaders);
        };
        // plugins are in an array of arrays. each top level array is processed
        // strictly in sequential order.
        PluginManager.prototype.installPluginSets = function (pluginDefs) {
            var _this = this;
            var loadSets = pluginDefs.map(function (set) {
                return function (resolve, reject) {
                    _this.installPlugins(set)
                        .then(function () {
                        resolve();
                    })
                        .catch(function (err) {
                        reject(err);
                    });
                };
            });
            return this.makePromiseIterator(loadSets);
        };
        return PluginManager;
    }());
    exports.PluginManager = PluginManager;
    return PluginManager;
});
