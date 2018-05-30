define([
    'bluebird',
    'lib/rpc'
], function (
    Promise, 
    rpc
) {
    'use strict';

    // function proxyMethod(obj, method, args) {
    //     if (!obj[method]) {
    //         throw {
    //             name: 'UndefinedMethod',
    //             message: 'The requested method "' + method + '" does not exist on this object',
    //             suggestion: 'This is a developer problem, not your fault'
    //         };
    //     }
    //     return obj[method].apply(obj, args);
    // }

    function factory(config) {
        var runtime = config.runtime;

        function start() {
            return true;
        }
        function stop() {
            return true;
        }
        function pluginHandler(widgetsConfig, pluginConfig) {
            return Promise.try(function () {
                // widgetsConfig.forEach(function (widgetDef) {
                //     // If source modules are not specified, we are using module
                //     // paths. A full path will start with "plugins/" and a relative
                //     // path won't. Prefix a relative path with the plugin's module path.
                //     if (!pluginConfig.usingSourceModules) {
                //         if (!widgetDef.module.match(/^plugins\//)) {
                //             widgetDef.module = [pluginConfig.moduleRoot, widgetDef.module].join('/');
                //         }
                //     }
                //     widgetManager.addWidget(widgetDef);
                // });
            });
        }

        function makeClient(arg) {
            let client = new rpc.RPCClient({
                runtime: runtime,
                module: arg.module
            });
            return client;
        }

        return {start, stop, pluginHandler, makeClient};        
    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
});