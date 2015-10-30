/*global
 define, require, console
 */
/*jslint
 browser:true,
 vars: true,
 white: true
 */
define([
    'bluebird'
        // 'kb_types',
        // 'kb.runtime'
],
    function (Promise) {
        'use strict';

        function factory(config) {
            var plugins = {},
                runtime = config.runtime,
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
//
//            function installMenus(menus) {
//                if (!menus) {
//                    return;
//                }
//                return menus.map(function (item) {
//                    return new Promise(function (resolve) {
//                        Runtime.send('navbar', 'add-menu-item', item);
//                        resolve();
//                    });
//                });
//            }
//
//            function installTypes(types) {
//                if (!types) {
//                    return;
//                }
//                return types.map(function (typeDef) {
//                    var type = typeDef.type,
//                        viewers = typeDef.viewers;
//                    viewers.forEach(function (viewerDef) {
//                        return new Promise(function (resolve) {
//                            Types.addViewer(type, viewerDef);
//                            resolve();
//                        });
//                    });
//                });
//            }
//
//            function installWidgets(widgets) {
//                /*
//                 * 
//                 */
//                return [new Promise(function (resolve) {
//                        if (widgets) {
//                            widgets.forEach(function (widgetDef) {
//                                Runtime.addWidget(widgetDef);
//                            });
//                        }
//                        resolve();
//                    })];
//            }
//
//            function installBoot(cfg) {
//                return [new Promise(function (resolve) {
//                        /*
//                         * Send a message to the app manager to install this widget
//                         * at the root.
//                         */
//                        // just hard code this for now.
//                        // Runtime.setRootWidget('root');
//                        //if (cfg.mainWidget) {
//                        //    Runtime.addWidget({
////
//                        //    });
//                        //}
//                        //Runtime.setRootWidget(cfg.boot);
//                        resolve();
//
//                    })];
//            }

            function arrayExtend(to, from) {
                if (from) {
                    from.forEach(function (item) {
                        to.push(item);
                    });
                }
                return to;
            }

//            var services = {};
//            function addService(type, def) {
//
//            }
            function installIntoService(pluralTypeName, def) {
                return Promise.try(function () {
                    var typeName;
                    var m = pluralTypeName.match(/(.*?)(:?(s)|($))$/);
                    if (!m) {
                        return;
                    }
                    typeName = m[1];
                    if (!runtime.hasService(typeName)) {
                        console.log(runtime.dumpServices());
                        throw {
                            name: 'MissingService',
                            message: 'The requested service "' + typeName + '" was not registered in the plugin manager',
                            suggestion: 'This is a web app configuration issue, not a user error'
                        };                        
                    }
                    var service = runtime.getService(typeName);
                    // console.log('SERVICE'); console.log(typeName); console.log(service);
                    if (service.pluginHandler) {
                        return service.pluginHandler(def);
                    }
                });
            }

            function installPlugin(pluginLocation, pluginDef) {
                // build up a list of modules and add them to the require config.
                return new Promise(function (resolve, reject) {
                    var paths = {},
                        shims = {},
                        sourcePath = pluginLocation.directory,
                        dependencies = [];

                    // load any styles.
                    // NB these are styles for the plugin as a whole.
                    // TODO: do away with this. the styles should be dependencies
                    // of the panel and widgets. widget css code is below...
                    if (pluginDef.source.styles) {
                        pluginDef.source.styles.forEach(function (style) {
                            if (style.file) {
                                dependencies.push('css!' + sourcePath + '/resources/css/' + style.file);
                            }
                        });
                    }

                    // Add each module defined to the require config paths.
                    pluginDef.source.modules.forEach(function (source) {
                        var jsSourceFile = source.file,
                            matched = jsSourceFile.match(/^(.+?)(?:(?:\.js$)|(?:$))/);
                        if (matched) {
                            jsSourceFile = matched[1];
                            var sourceFile = sourcePath + '/modules/' + jsSourceFile;
                            paths[source.module] = sourceFile;
                            // A module may also have an accompanying css file, which will
                            // be added as a dependency via shims.
                            if (source.css) {
                                var styleModule = source.module + '_css';
                                paths[styleModule] = sourceFile;
                                shims[source.module] = {deps: ['css!' + styleModule]};
                            }
                        }
                    });

                    // This usage of require.config will merge with the existing
                    // require configuration.
                    require.config({paths: paths, shim: shims});

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
                                path: '/' + sourcePath + '/resources'
                            }
                        };
                    });

                    // Now install any routes.
                    if (pluginDef.install) {
                        require(dependencies, function () {
                            var installSteps = [];

                            Object.keys(pluginDef.install).forEach(function (serviceName) {
                                var installDef = pluginDef.install[serviceName],
                                    intallationPromise = installIntoService(serviceName, installDef);
                                arrayExtend(installSteps, [intallationPromise]);
                            });
                            // Do all of the install steps.
                            Promise.all(installSteps)
                                .then(function (doneSteps) {
//                                    doneSteps.forEach(function (step) {
//                                        if (step.isRejected()) {
//                                            console.log('install step error for ' + pluginLocation.name);
//                                            console.log(step.reason());
//                                        }
//                                    })
                                    resolve();
                                })
                                .catch(function (err) {
                                    console.log('ERROR');
                                    console.log(err);
                                    reject(err);
                                });
                        });
                    } else {
                        console.log('No installation?');
                        resolve();
                    }
                });
            }
            function makePromiseIterator(actions) {
                var x = 0;
                return new Promise(function (topResolve, topReject) {
                    function promiseIterator(actions) {
                        var iter = String(x);
                        x += 1;
                        if (actions === undefined || actions.length === 0) {
                            topResolve('DONE');
                        }
                        var next = actions[0],
                            rest = actions.slice(1);
                        Promise.try(function () {
                            return new Promise(function (resolve, reject, notify) {
                                next(resolve, reject, notify);
                            });
                        }).then(function (result) {
                            promiseIterator(rest);
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
            function loadPlugin(pluginNameOrLocation) {
                var pluginLocation;
                if (typeof pluginNameOrLocation === 'string') {
                    pluginLocation = {
                        name: pluginNameOrLocation,
                        directory: 'plugins/' + pluginNameOrLocation
                    };
                } else {
                    pluginLocation = pluginNameOrLocation;
                }
                return new Promise(function (resolve, reject) {
                    require(['yaml!' + pluginLocation.directory + '/config.yml'], function (pluginConfig) {
                        installPlugin(pluginLocation, pluginConfig)
                            .then(function () {
                                resolve(pluginLocation);
                            })
                            .catch(function (err) {
                                reject(err);
                            });
                    });
                });
            }
            
            function installPlugins(pluginDefs) {
                var loaders = pluginDefs.map(function (plugin) {
                    return loadPlugin(plugin);
                });
                return Promise.settle(loaders);
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