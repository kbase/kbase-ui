define([
    'bluebird'
], function (Promise) {
    'use strict';

    function factory(config) {
        var plugins = {},
            runtime = config.runtime,
            moduleBase = config.moduleBase || '/modules',
            services = {};

        /*
         * All of these installXXX installers return an array of 
         * promises.
         */

        function registerService(serviceNames, serviceDef) {
            serviceNames.forEach(function (name) {
                services[name] = serviceDef;
            });
        }

        function getService(name) {
            return services[name];
        }

        function arrayExtend(to, from) {
            if (from) {
                from.forEach(function (item) {
                    to.push(item);
                });
            }
            return to;
        }

        function installIntoService(pluralTypeName, def, pluginConfig) {
            return Promise.try(function () {
                var typeName;
                // weird, perhaps, way to strip off a terminal "s".
                var nameMatch = pluralTypeName.match(/(.*?)(:?(s)|($))$/);
                if (!nameMatch) {
                    return;
                }
                typeName = nameMatch[1];
                if (!runtime.hasService(typeName)) {
                    throw {
                        name: 'MissingService',
                        message: 'The requested service "' + typeName + '" was not registered in the plugin manager',
                        suggestion: 'This is a web app configuration issue, not a user error'
                    };
                }
                // NB to avoid an empty call to installIntoService, just omit the
                // service from the install section.
                if (def) {
                    var service = runtime.getService(typeName);
                    if (service.pluginHandler) {
                        return service.pluginHandler(def, pluginConfig);
                    }
                }
            });
        }

        function installPlugin(pluginLocation, pluginDef) {
            // build up a list of modules and add them to the require config.
            return new Promise(function (resolve, reject) {
                var paths = {},
                    shims = {},
                    sourcePath = pluginLocation.directory,
                    dependencies = [],
                    usingSourceModules = false;

                // load any styles.
                // NB these are styles for the plugin as a whole.
                // TODO: do away with this. the styles should be dependencies
                // of the panel and widgets. widget css code is below...
                if (pluginDef.source) {
                    if (pluginDef.source.styles) {
                        pluginDef.source.styles.forEach(function (style) {
                            if (style.file) {
                                dependencies.push('css!' + sourcePath + '/resources/css/' + style.file);
                            }
                        });
                    }

                    // Add each module defined to the require config paths.
                    if (pluginDef.source.modules) {
                        if (pluginDef.source.modules.length > 0) {
                            usingSourceModules = true;
                        }
                        pluginDef.source.modules.forEach(function (source) {
                            var jsSourceFile = source.file,
                                matched = jsSourceFile.match(/^([\S\s]+?)(?:(?:\.js$)|(?:$))/);
                            if (matched) {
                                jsSourceFile = matched[1];
                                var sourceFile = sourcePath + '/modules/' + jsSourceFile;
                                paths[source.module] = sourceFile;
                                // A module may also have an accompanying css file, which will
                                // be added as a dependency via shims.
                                if (source.css) {
                                    var styleModule = source.module + '_css';
                                    paths[styleModule] = sourceFile;
                                    shims[source.module] = { deps: ['css!' + styleModule] };
                                }
                            }
                        });
                    }
                }

                // This usage of require.config will merge with the existing
                // require configuration.
                require.config({ paths: paths, shim: shims });

                // Create a dynamic module for the plugin to use. The current use
                // case is for code within the plugin to have access to the path
                // to the plugin for loading other files.
                // 
                // NB: this implies that the plugin package name is unique in 
                // the system. To enforce or at least help developers with this
                // we should have a plugin registry.
                define('kb_plugin_' + pluginDef.package.name, [], function () {
                    return {
                        plugin: {
                            name: pluginDef.package.name,
                            resources: {
                                // to be used for module loading, e.g. yaml, json, 
                                // css through requirejs
                                modulePath: '/' + sourcePath + '/resources',
                                // to be used for document references, e.g. img, css doc
                                documentPath: moduleBase + '/' + sourcePath + '/resources'
                            },
                            path: '/' + sourcePath + '/resources',
                            modulePath: '/' + sourcePath + '/resources',
                            fullPath: moduleBase + '/' + sourcePath + '/resources'
                        }
                    };
                });

                var pluginConfig = {
                    usingSourceModules: usingSourceModules,
                    root: sourcePath,
                    moduleRoot: sourcePath + '/modules',
                    resourcesRoot: moduleBase + '/' + sourcePath + '/resources'
                };

                // Now install any routes.
                if (pluginDef.install) {
                    require(dependencies, function () {
                        var installSteps = [];

                        Object.keys(pluginDef.install).forEach(function (serviceName) {
                            var installDef = pluginDef.install[serviceName],
                                intallationPromise = installIntoService(serviceName, installDef, pluginConfig);
                            if (intallationPromise) {
                                arrayExtend(installSteps, [intallationPromise]);
                            }
                        });
                        // Do all of the install steps.
                        Promise.all(installSteps)
                            .then(function (doneSteps) {
                                resolve();
                            })
                            .catch(function (err) {
                                console.error(err);
                                reject(err);
                            });
                    });
                } else {
                    resolve();
                }
            });
        }

        function makePromiseIterator(actions) {
            return new Promise(function (topResolve, topReject) {
                function promiseIterator(actions) {
                    if (actions === undefined || actions.length === 0) {
                        topResolve('DONE');
                    }
                    var next = actions[0],
                        rest = actions.slice(1);
                    Promise.try(function () {
                        return new Promise(function (resolve, reject, notify) {
                            next(resolve, reject, notify);
                        });
                    }).then(function () {
                        return promiseIterator(rest);
                    }).catch(function (err) {
                        topReject(err);
                    });
                }
                promiseIterator(actions);
            });
        }

        /**
         * 
         * @param {type} pluginDef
         * @returns {Promise}
         */
        function loadPlugin(pluginDef) {
            if (pluginDef.disabled) {
                return;
            }
            return new Promise(function (resolve, reject) {
                require(['yaml!' + pluginDef.directory + '/config.yml'], function (pluginConfig) {
                    installPlugin(pluginDef, pluginConfig)
                        .then(function () {
                            resolve(pluginDef);
                        })
                        .catch(function (err) {
                            reject(err);
                        });
                });
            });
        }

        function installPlugins(pluginDefs) {
            var loaders = Object.keys(pluginDefs).map(function (pluginName) {
                return loadPlugin(pluginDefs[pluginName]);
            });
            return Promise.all(loaders);
        }

        // plugins are in an array of arrays. each top level array is processed
        // strictly in sequential order.
        function installPluginSets(pluginDefs) {
            var loadSets = pluginDefs.map(function (set) {
                return function (resolve, reject, notify) {
                    installPlugins(set)
                        .then(function () {
                            resolve();
                        })
                        .catch(function (err) {
                            reject(err);
                        });
                };
            });

            return makePromiseIterator(loadSets);
        }

        return {
            installPlugins: installPlugins,
            installPluginSets: installPluginSets,
            registerService: registerService
        };
    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
});