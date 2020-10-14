define(['bluebird'], (Promise) => {

    // Note that we use the global require here because we need to
    // update the global confirmation.
    const prequire = Promise.promisify(window.require);

    class PluginManager {
        constructor({runtime, moduleBase}) {
            this.runtime = runtime;
            this.moduleBase = moduleBase || '/modules';
            this.services = {};
        }

        /*
         * All of these installXXX installers return an array of
         * promises.
         */

        registerService(serviceNames, serviceDef) {
            serviceNames.forEach((name) => {
                this.services[name] = serviceDef;
            });
        }

        arrayExtend(to, from) {
            if (from) {
                from.forEach((item) => {
                    to.push(item);
                });
            }
            return to;
        }

        installIntoService(pluralTypeName, def, pluginConfig, pluginDef) {
            return Promise.try(() => {
                // weird, perhaps, way to strip off a terminal "s".
                const nameMatch = pluralTypeName.match(/(.*?)(:?(s)|($))$/);
                if (!nameMatch) {
                    return;
                }
                const typeName = nameMatch[1];
                if (!this.runtime.hasService(typeName)) {
                    console.error('missing service', typeName, def, pluginConfig);
                    throw {
                        name: 'MissingService',
                        message: 'The requested service "' + typeName + '" was not registered in the plugin manager',
                        suggestion: 'This is a web app configuration issue, not a user error'
                    };
                }
                // NB to avoid an empty call to installIntoService, just omit the
                // service from the install section.
                if (def) {
                    const service = this.runtime.getService(typeName);
                    if (service.pluginHandler) {
                        return service.pluginHandler(def, pluginConfig, pluginDef);
                    }
                }
            });
        }

        installLegacyPlugin(pluginLocation, pluginDef) {
            // build up a list of modules and add them to the require config.
            return Promise.try(() => {
                const paths = {};
                const shims = {};
                const sourcePath = pluginLocation.directory;
                const dependencies = [];

                let usingSourceModules = false;

                // load any styles.
                // NB these are styles for the plugin as a whole.
                if (pluginDef.source) {
                    if (pluginDef.source.styles) {
                        pluginDef.source.styles.forEach((style) => {
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
                        pluginDef.source.modules.forEach((source) => {
                            let jsSourceFile = source.file;
                            const matched = jsSourceFile.match(/^([\S\s]+?)(?:(?:\.js$)|(?:$))/);
                            if (matched) {
                                jsSourceFile = matched[1];
                                const sourceFile = sourcePath + '/modules/' + jsSourceFile;
                                paths[source.module] = sourceFile;
                                // A module may also have an accompanying css file, which will
                                // be added as a dependency via shims.
                                if (source.css) {
                                    const styleModule = source.module + '_css';
                                    paths[styleModule] = sourceFile;
                                    shims[source.module] = {deps: ['css!' + styleModule]};
                                }
                            }
                        });
                    }
                }

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
                define('kb_plugin_' + pluginDef.package.name, [], () => {
                    return {
                        plugin: {
                            name: pluginDef.package.name,
                            resources: {
                                // to be used for module loading, e.g. yaml, json,
                                // css through requirejs
                                modulePath: '/' + sourcePath + '/resources',
                                // to be used for document references, e.g. img, css doc
                                documentPath: this.moduleBase + '/' + sourcePath + '/resources'
                            },
                            path: '/' + sourcePath + '/resources',
                            modulePath: '/' + sourcePath + '/resources',
                            fullPath: this.moduleBase + '/' + sourcePath + '/resources'
                        }
                    };
                });

                const pluginConfig = {
                    usingSourceModules: usingSourceModules,
                    root: sourcePath,
                    moduleRoot: sourcePath + '/modules',
                    resourcesRoot: this.moduleBase + '/' + sourcePath + '/resources'
                };

                // Now install any ui service configuration.
                const serviceConfigs = pluginDef.services || pluginDef.install;
                if (serviceConfigs) {
                    return prequire(dependencies)
                        .then(() => {
                            const installSteps = [];

                            Object.keys(serviceConfigs).forEach((serviceName) => {
                                const installDef = serviceConfigs[serviceName];
                                const installationPromise = this.installIntoService(serviceName, installDef, pluginConfig, pluginDef);
                                if (installationPromise) {
                                    this.arrayExtend(installSteps, [installationPromise]);
                                }
                            });
                            // Do all of the install steps.
                            return Promise.all(installSteps);
                        });
                } else {
                    return null;
                }
            });
        }

        installIFramePlugin(pluginLocation, pluginDef, options) {
            // build up a list of modules and add them to the require config.
            return Promise.try(() => {
                const sourcePath = pluginLocation.directory;
                const dependencies = [];
                const usingSourceModules = false;

                const pluginConfig = {
                    usingSourceModules: usingSourceModules,
                    root: sourcePath,
                    iframePath: sourcePath + '/iframe_root/index.html'
                };

                // hmm, hack this... for now ...
                pluginDef.package.name = options.pluginName;

                // Now install any ui service configuration.
                const serviceConfigs = pluginDef.services || pluginDef.install;
                if (serviceConfigs) {
                    return prequire(dependencies).then(() => {
                        const installSteps = [];

                        Object.keys(serviceConfigs).forEach((serviceName) => {
                            const installDef = serviceConfigs[serviceName];
                            const installationPromise = this.installIntoService(serviceName, installDef, pluginConfig, pluginDef);
                            if (installationPromise) {
                                this.arrayExtend(installSteps, [installationPromise]);
                            }
                        });
                        // Do all of the install steps.
                        return Promise.all(installSteps);
                    });
                } else {
                    return null;
                }
            });
        }

        installPlugin(pluginLocation, pluginDef, options) {
            // build up a list of modules and add them to the require config.
            return Promise.try(() => {
                // Plugin type - legacy or iframe.
                const pluginType = pluginDef.package.type || 'iframe';

                switch (pluginType) {
                case 'legacy':
                    return this.installLegacyPlugin(pluginLocation, pluginDef);
                case 'iframe':
                    return this.installIFramePlugin(pluginLocation, pluginDef, options);
                default:
                    throw new Error('Unsupported plugin type: ' + pluginType);
                }
            });
        }

        makePromiseIterator(actions) {
            return new Promise((topResolve, topReject) => {
                function promiseIterator(actions) {
                    if (actions === undefined || actions.length === 0) {
                        topResolve('DONE');
                    }
                    const next = actions[0];
                    const rest = actions.slice(1);
                    Promise.try(() => {
                        return new Promise((resolve, reject, notify) => {
                            next(resolve, reject, notify);
                        });
                    })
                        .then(() => {
                            return promiseIterator(rest);
                        })
                        .catch((err) => {
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
        loadPlugin(pluginDef, options) {
            if (pluginDef.disabled) {
                return;
            }
            return new Promise((resolve, reject) => {
                require(['yaml!' + pluginDef.directory + '/config.yml'], (pluginConfig) => {
                    this.installPlugin(pluginDef, pluginConfig, options)
                        .then(() => {
                            resolve(pluginDef);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
            });
        }

        installPlugins(pluginDefs) {
            const loaders = Object.keys(pluginDefs).map((pluginName) => {
                return this.loadPlugin(pluginDefs[pluginName], {pluginName});
            });
            return Promise.all(loaders);
        }

        // plugins are in an array of arrays. each top level array is processed
        // strictly in sequential order.
        installPluginSets(pluginDefs) {
            const loadSets = pluginDefs.map((set) => {
                return (resolve, reject) => {
                    this.installPlugins(set)
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            reject(err);
                        });
                };
            });

            return this.makePromiseIterator(loadSets);
        }
    }

    return PluginManager;
});
