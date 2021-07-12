/* global define */
// Note that we use the global require here because we need to
// update the global confirmation.
// const prequire = Promise.promisify(window.require);

import { tryPromise } from "./kb_lib/Utils";
import {
    PluginConfig, PluginDefinition, PluginLoadConfig,
    PluginServiceDefinition, Runtime, Service, AMDRequire
} from "./types";

// TODO: a hack to override the node require definition built into TS
// TODO: there may be a compiler option to allow using AMD require?
declare var require: AMDRequire;

interface IframeInstallerConfig {
    usingSourceModules: boolean;
    root: string;
    iframePath: string;
}

interface LegacyInstallerConfig {
    usingSourceModules: boolean;
    root: string;
    moduleRoot: string;
    resourcesRoot: string;
}

interface PluginManagerConstructorParams {
    runtime: Runtime;
    moduleBase: string;
}

export type PluginType = 'legacy' | 'iframe';

export class PluginManager {
    runtime: Runtime;
    moduleBase: string;
    services: Map<string, Service<any>>;
    constructor({ runtime, moduleBase }: PluginManagerConstructorParams) {
        this.runtime = runtime;
        this.moduleBase = moduleBase || '/modules';
        this.services = new Map<string, Service<any>>();
    }

    /*
     * All of these installXXX installers return an array of
     * promises.
     */

    installIntoService(
        pluralTypeName: string,
        serviceDefinition: PluginServiceDefinition,
        pluginDef: PluginDefinition,
        pluginConfig: PluginConfig
    ) {
        return tryPromise(() => {
            // weird, perhaps, way to strip off a terminal "s".
            const nameMatch = pluralTypeName.match(/(.*?)(:?(s)|($))$/);
            if (!nameMatch) {
                return;
            }
            const typeName = nameMatch[1];
            if (!this.runtime.hasService(typeName)) {
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
                const service = this.runtime.service(typeName);
                if (service.pluginHandler) {
                    return service.pluginHandler(serviceDefinition, 'plugin', pluginConfig.package.name);
                }
            }
        });
    }

    installLegacyPlugin(pluginLoadConfig: PluginLoadConfig, pluginConfig: PluginConfig) {
        // build up a list of modules and add them to the require config.
        return tryPromise(() => {
            const sourcePath = pluginLoadConfig.directory;

            let usingSourceModules = false;

            const installerConfig: LegacyInstallerConfig = {
                usingSourceModules,
                root: sourcePath,
                moduleRoot: sourcePath + '/modules',
                resourcesRoot: this.moduleBase + '/' + sourcePath + '/resources'
            };

            // Now install any ui service configuration.
            const serviceConfigs = pluginConfig.services || pluginConfig.install;
            if (!serviceConfigs) {
                return null;
            }

            return Promise.all(Object.entries(serviceConfigs)
                .map(([serviceName, serviceConfig]) => {
                    return this.installIntoService(serviceName, serviceConfig, installerConfig, pluginConfig);
                }));
        });

    }

    installIFramePlugin(pluginLoadConfig: PluginLoadConfig, pluginConfig: PluginConfig) {
        // build up a list of modules and add them to the require config.
        return tryPromise(() => {
            const pluginInstallerConfig: IframeInstallerConfig = {
                usingSourceModules: false,
                root: pluginLoadConfig.directory,
                iframePath: `${pluginLoadConfig.directory}/iframe_root/index.html`
            };

            // This overrides the plugin's own concept of plugin name with
            // the one provided in kbase-ui's name for the plugin, which is derived
            // from plugins.yml
            // This allows us to support loading the same plugin twice under different
            // names. This has very limited utility ... but is very useful when needed.
            // E.g. to load different versions of the same plugin for side by side
            // evaluation
            // TODO: come up with a better way of doing this!
            pluginConfig.package.name = pluginLoadConfig.name;

            // Now install any ui service configuration.
            const serviceConfigs = pluginConfig.services || pluginConfig.install;
            if (!serviceConfigs) {
                return null;
            }

            return Promise.all(Object.entries(serviceConfigs)
                .map(([serviceName, serviceConfig]) => {
                    return this.installIntoService(serviceName, serviceConfig, pluginInstallerConfig, pluginConfig);
                }));
        });
    }

    installPlugin(pluginLoadConfig: PluginLoadConfig, pluginConfig: PluginConfig) {
        // build up a list of modules and add them to the require config.
        return tryPromise(() => {
            // Plugin type - legacy or iframe.
            const pluginType: PluginType = pluginConfig.package.type || 'iframe';

            switch (pluginType) {
                case 'legacy':
                    return this.installLegacyPlugin(pluginLoadConfig, pluginConfig);
                case 'iframe':
                    return this.installIFramePlugin(pluginLoadConfig, pluginConfig);
                default:
                    throw new Error('Unsupported plugin type: ' + pluginType);
            }
        });
    }

    /**
     *
     * @param {type} pluginDef
     * @returns {Promise}
     */
    loadPlugin(pluginLoadConfig: PluginLoadConfig) {
        if (pluginLoadConfig.disabled) {
            return;
        }
        return new Promise((resolve, reject) => {
            require([`yaml!${pluginLoadConfig.directory}/config.yml`], (pluginConfig: PluginConfig) => {
                this.installPlugin(pluginLoadConfig, pluginConfig)
                    .then(() => {
                        resolve(pluginLoadConfig);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        });
    }

    installPlugins(pluginLoadConfigs: Map<string, PluginLoadConfig>) {
        const loaders = Array.from(pluginLoadConfigs, ([_pluginName, pluginLoadConfig]) => {
            return this.loadPlugin(pluginLoadConfig);
        });
        return Promise.all(loaders);
    }
}
