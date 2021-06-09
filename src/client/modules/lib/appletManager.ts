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

interface AppletInstallerConfig {
    usingSourceModules: boolean;
    root: string;
    // moduleRoot: string;
    // resourcesRoot: string;
}

interface AppletManagerConstructorParams {
    runtime: Runtime;
    moduleBase: string;
}

export class AppletManager {
    runtime: Runtime;
    moduleBase: string;
    services: Map<string, Service<any>>;
    constructor({ runtime, moduleBase }: AppletManagerConstructorParams) {
        this.runtime = runtime;
        this.moduleBase = moduleBase || '/modules';
        this.services = new Map<string, Service<any>>();
    }

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
                    return service.pluginHandler(serviceDefinition, 'applet', pluginConfig.package.name);
                }
            }
        });
    }

    installApplet(pluginLoadConfig: PluginLoadConfig, pluginConfig: PluginConfig) {
        // build up a list of modules and add them to the require config.
        return tryPromise(() => {
            const sourcePath = pluginLoadConfig.directory;
            let usingSourceModules = false;

            const installerConfig: AppletInstallerConfig = {
                usingSourceModules,
                root: sourcePath,
                // moduleRoot: sourcePath + '/modules',
                // resourcesRoot: this.moduleBase + '/' + sourcePath + '/resources'
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

    /**
     *
     * @param {type} pluginDef
     * @returns {Promise}
     */
    loadApplet(appletLoadConfig: PluginLoadConfig) {
        if (appletLoadConfig.disabled) {
            return;
        }
        return new Promise((resolve, reject) => {
            require([`yaml!${appletLoadConfig.directory}/config.yml`], (pluginConfig: PluginConfig) => {
                this.installApplet(appletLoadConfig, pluginConfig)
                    .then(() => {
                        resolve(appletLoadConfig);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        });
    }

    installApplets(appletLoadConfigs: Map<string, PluginLoadConfig>) {
        const loaders = Array.from(appletLoadConfigs, ([_appletName, appletLoadConfig]) => {
            return this.loadApplet(appletLoadConfig);
        });
        return Promise.all(loaders);
    }
}
