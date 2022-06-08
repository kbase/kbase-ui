define([
    'bluebird',
    'uuid',
    './hub',
    'kb_lib/props',
    '../lib/utils',

    'json!config/plugins.json',
    'json!config/applets.json',
    'json!config/config.json',
    'json!deploy/config.json',

    // For effect
    'bootstrap',
    'css!font_awesome',
    'css!app/styles/kb-bootstrap',
    'css!app/styles/kb-ui'
], (
    Promise,
    {v4: uuidv4},
    Hub,
    props,
    utils,
    pluginsConfig,
    appletsConfig,
    appConfigBase,
    deployConfig
) => {

    // Set up global configuration of bluebird promises library.
    // This is the first invocation of bluebird.
    Promise.config({
        warnings: true,
        longStackTraces: true,
        cancellation: true
    });

    // establish a global root namespace upon which we can
    // hang data, which at this time is just the app.
    const globalRef = uuidv4();
    const global = (window[globalRef] = new props.Props());

    function start() {
        return Promise.try(() => {
            // merge the deploy and app config.
            const mergedConfig = utils.mergeObjects([appConfigBase, deployConfig]);

            // Siphon off core services.
            // The services config traditionally has configuration for various
            // services which may be needed by the ui app or by a plugin.
            // It was originally a catch-all for any service-like dependency
            // which needed configuration support.
            // A core service is defined as a network-api based service which is
            // directly accessed by kbase-ui or plugins.
            // Not all registered "services" are "core services".
            // E.g. narrative is registered as a service.
            // To support the service manager, which monitors core services, we
            // just make life easier by making a separate array of core services
            // extracted from the services.
            // TODO: we can get rid of this malarky if we can remove non-core
            // services from the services config.

            mergedConfig.coreServices = Object.entries(mergedConfig.services)
                .filter(([, serviceConfig]) => {
                    return serviceConfig.coreService;
                })
                .map(([module, serviceConfig]) => {
                    return {
                        url: serviceConfig.url,
                        module,
                        type: serviceConfig.type,
                        version: serviceConfig.version
                    };
                });

            // Expand aliases.
            // This simply makes a new entry in the services object for
            // each alias, with the alias being set to the original
            // service config..
            // This allows accessing a service config via an alias
            // to operate just like accessing a service config via the
            // module name..
            Object.entries(mergedConfig.services)
                .forEach(([serviceKey, serviceConfig]) => {
                    if (serviceConfig.aliases) {
                        serviceConfig.aliases.forEach((alias) => {
                            if (mergedConfig.services[alias]) {
                                throw new Error(
                                    `Service alias for ${  serviceKey  } already in use: ${  alias}`
                                );
                            }
                            mergedConfig.services[alias] = serviceConfig;
                        });
                        delete serviceConfig.aliases;
                    }
                });

            // recast the plugins as a map.
            // We'll see how good this approach is when we
            // convert this file to TS :)
            const plugins = new Map();
            Object.entries(pluginsConfig.plugins).map(([key, value]) => {
                plugins.set(key, value);
            });

            const applets = new Map();
            Object.entries(appletsConfig.applets).map(([key, value]) => {
                applets.set(key, value);
            });

            const app = new Hub({
                appConfig: mergedConfig,
                nodes: {
                    root: {
                        selector: '#root'
                    }
                },
                applets,
                plugins,
                services: mergedConfig.ui.services
            });
            global.setItem('app', app);
            return app.start();
        });
    }

    return {start};
});