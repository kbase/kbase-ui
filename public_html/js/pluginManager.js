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

        function factory(cfg) {
            var plugins = {},
                config = cfg;

            /*
             * All of these installXXX installers return an array of 
             * promises.
             */

//            function installRoutes(routes) {
//                if (!routes) {
//                    return;
//                }
//                return routes.map(function (route) {
//                    return new Promise(function (resolve) {
//                        // Runtime.addRoute(route);
//                        /*if (route.panelFactory) {
//                         require([route.panelFactory], function (factory) {
//                         Runtime.addRoute({
//                         path: route.path,
//                         queryParams: route.queryParams,
//                         config: {
//                         pluginPath: '/' + sourcePath
//                         },
//                         panelFactory: factory
//                         });
//                         resolve();
//                         }, function (err) {
//                         console.log('Error loading panel factory');
//                         console.log(err);
//                         reject({
//                         name: 'routeError',
//                         message: 'invalid route',
//                         route: route
//                         });
//                         });
//                         } else if (route.panelObject) {
//                         require([route.panelObject], function (obj) {
//                         Runtime.addRoute({
//                         path: route.path,
//                         queryParams: route.queryParams,
//                         config: {
//                         pluginPath: sourcePath
//                         },
//                         panelObject: obj
//                         }, function (err) {
//                         console.log('Error loading panel object');
//                         console.log(err);
//                         });
//                         resolve();
//                         });
//                         */
//                        if (route.widget) {
//                            // ADD ROUTE WIDGET HERE...
//                            Runtime.addRoute({
//                                path: route.path,
//                                queryParams: route.queryParams,
//                                config: {
//                                },
//                                widget: route.widget
//                            });
//                            resolve();
//                        } else if (route.redirectHandler) {
//                            Runtime.addRoute(route);
//                            resolve();
//                        } else {
//                            throw {
//                                name: 'routeError',
//                                message: 'invalid route',
//                                route: route
//                            };
//                        }
//
//                    });
//                });
//            }
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

            var services = {};
            function addService(type, def) {

            }
            function installService(type, def) {
                console.log('about to install service ... ' + type);
                console.log(def);
                // Install Routes
                //arrayExtend(installSteps, installRoutes(pluginDef.install.routes));

                // Install main menu items.
                //arrayExtend(installSteps, installMenus(pluginDef.install.menu));

                // Install widgets
                //arrayExtend(installSteps, installWidgets(pluginDef.install.widgets));

                // Install type capabilities.
                //arrayExtend(installSteps, installTypes(pluginConfig.install.types));

                // Install boot.
                // arrayExtend(installSteps, installBoot(pluginConfig.install.boot));
                return new Promise(function (resolve) {
                    console.log('This would be installing the service: ' + type);
                    resolve();
                });
            }

            function installPlugin(name, pluginDef) {
                // build up a list of modules and add them to the require config.
                return new Promise(function (resolve) {
                    var paths = {},
                        shims = {},
                        sourcePath = pluginDef.directory + '/source',
                        dependencies = [];

                    // load any styles.
                    // NB these are styles for the plugin as a whole.
                    // TODO: do away with this. the styles should be dependencies
                    // of the panel and widgets. widget css code is below...
                    console.log(pluginDef);
                    if (pluginDef.source.styles) {
                        pluginDef.source.styles.forEach(function (style) {
                            dependencies.push('css!' + sourcePath + style.file);
                        });
                    }

                    // Add each module defined to the require config paths.
                    pluginDef.source.modules.forEach(function (source) {
                        var jsSourceFile = source.file,
                            matched = jsSourceFile.match(/^(.+?)(?:(?:\.js$)|(?:$))/);
                        if (matched) {
                            jsSourceFile = matched[1];
                            var sourceFile = sourcePath + jsSourceFile;
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
                                path: '/' + sourcePath
                            }
                        };
                    });

                    // Now install any routes.
                    if (pluginDef.install) {
                        require(dependencies, function () {
                            var installSteps = [];

                            Object.keys(pluginDef.install).forEach(function (serviceName) {
                                var installDef = pluginDef.install[serviceName],
                                    intallationPromise = installService(serviceName, installDef);
                                arrayExtend(installSteps, intallationPromise);
                            });

                            // Do all of the install steps.
                            Promise.all(installSteps)
                                .then(function (doneSteps) {
                                    resolve();
                                })
                                .catch(function (err) {
                                    console.log('ERROR');
                                    console.log(err);
                                });
                        });
                    } else {
                        console.log('No installation?');
                        resolve();
                    }
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
                        console.log(pluginLocation);
                        installPlugin(pluginLocation.name, pluginConfig)
                            .then(function () {
                                resolve();
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
                return new Promise.all(loaders);
            }

            return {
                installPlugins: installPlugins
            };
        }
        return {
            make: function (config) {
                return factory(config);
            }
        };
    });