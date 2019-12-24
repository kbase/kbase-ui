define([
    'bluebird',
    'uuid',
    './hub',
    'kb_lib/props',
    'kb_knockout/load',
    '../lib/utils',

    'yaml!config/plugin.yml',
    'json!config/config.json',
    'json!deploy/config.json',

    // For effect
    'bootstrap',
    'css!font_awesome',
    'css!app/styles/kb-bootstrap',
    'css!app/styles/kb-icons',
    'css!app/styles/kb-ui',
    'css!app/styles/kb-datatables'
], function (Promise, Uuid, Hub, props, knockoutLoader, utils, pluginConfig, appConfigBase, deployConfig) {
    'use strict';

    // Set up global configuration of bluebird promises library.
    // This is the first invocation of bluebird.
    Promise.config({
        warnings: true,
        longStackTraces: true,
        cancellation: true
    });

    // establish a global root namespace upon which we can
    // hang sine-qua-non structures, which at this time is
    // just the app.
    const globalRef = new Uuid(4).format();
    const global = (window[globalRef] = new props.Props());

    function start() {
        // merge the deploy and app config.

        // Siphon off core services.
        var coreServices = Object.keys(deployConfig.services)
            .map((key) => {
                return [key, deployConfig.services[key]];
            })
            .filter(([, serviceConfig]) => {
                return serviceConfig.coreService;
            })
            .map(([module, serviceConfig]) => {
                return {
                    url: serviceConfig.url,
                    module: module,
                    type: serviceConfig.type,
                    version: serviceConfig.version
                };
            });
        deployConfig.coreServices = coreServices;

        // Expand aliases
        Object.keys(deployConfig.services).forEach((serviceKey) => {
            const serviceConfig = deployConfig.services[serviceKey];
            const aliases = serviceConfig.aliases;
            if (serviceConfig.aliases) {
                delete serviceConfig.aliases;
                aliases.forEach((alias) => {
                    if (deployConfig.services[alias]) {
                        throw new Error(
                            'Service alias for ' + serviceKey + ' already in used: ' + alias
                        );
                    }
                    deployConfig.services[alias] = serviceConfig;
                });
            }
        });

        const app = new Hub({
            appConfig: deployConfig,
            nodes: {
                root: {
                    selector: '#root'
                }
            },
            plugins: pluginConfig.plugins,
            services: deployConfig.ui.services
        });
        global.setItem('app', app);
        return knockoutLoader.load().then((ko) => {
            // Knockout Defaults
            ko.options.deferUpdates = true;

            return app.start();
        });
    }

    return { start };
});
