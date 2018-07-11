define([
    'promise',
    // 'kb_widget/widgetManager'
    'kb_lib/widget/manager'
], function (
    Promise,
    widgetManager
) {
    'use strict';

    function proxyMethod(obj, method, args) {
        if (!obj[method]) {
            throw {
                name: 'UndefinedMethod',
                message: 'The requested method "' + method + '" does not exist on this object',
                suggestion: 'This is a developer problem, not your fault'
            };
        }
        return obj[method].apply(obj, args);
    }

    class WidgetService {
        constructor({config, params}) {
            // the config has two properties:
            // config - from the service config
            // params - runtime params required for integration with ui runtime

            if (!params.runtime) {
                throw new Error('WidgetService start requires a runtime object; provide as "runtime"');
            }
            this.widgetManager = new widgetManager.WidgetManager({
                baseWidgetConfig: {
                    runtime: params.runtime
                }
            });
        }
        start() {
            return true;
        }
        stop() {
            return true;
        }
        pluginHandler(widgetsConfig, pluginConfig) {
            return Promise.try(() => {
                widgetsConfig.forEach((widgetDef) => {
                    // If source modules are not specified, we are using module
                    // paths. A full path will start with "plugins/" and a relative
                    // path won't. Prefix a relative path with the plugin's module path.
                    if (!pluginConfig.usingSourceModules) {
                        if (!widgetDef.module.match(/^plugins\//)) {
                            widgetDef.module = [pluginConfig.moduleRoot, widgetDef.module].join('/');
                        }
                    }
                    this.widgetManager.addWidget(widgetDef);
                });
            });
        }
        getWidget() {
            return proxyMethod(this.widgetManager, 'getWidget', arguments);
        }
        makeWidget() {
            return proxyMethod(this.widgetManager, 'makeWidget', arguments);
        }

        // makeWidget() {

        // }
        // getWidget() {

        // }
    }
    // function factory(config) {
    //     var widgetManager =

    //     function start() {
    //         return true;
    //     }
    //     function stop() {
    //         return true;
    //     }
    //     function pluginHandler(widgetsConfig, pluginConfig) {
    //         return Promise.try(function () {
    //             widgetsConfig.forEach(function (widgetDef) {
    //                 // If source modules are not specified, we are using module
    //                 // paths. A full path will start with "plugins/" and a relative
    //                 // path won't. Prefix a relative path with the plugin's module path.
    //                 if (!pluginConfig.usingSourceModules) {
    //                     if (!widgetDef.module.match(/^plugins\//)) {
    //                         widgetDef.module = [pluginConfig.moduleRoot, widgetDef.module].join('/');
    //                     }
    //                 }
    //                 widgetManager.addWidget(widgetDef);
    //             });
    //         });
    //     }
    //     return {
    //         // lifecycle interface
    //         start: start,
    //         stop: stop,
    //         // plugin interface
    //         pluginHandler: pluginHandler,
    //         widgetManager: widgetManager,
    //         makeWidget: function () {
    //             return proxyMethod(widgetManager, 'makeWidget', arguments);
    //         },
    //         getWidget: function () {
    //             return proxyMethod(widgetManager, 'getWidget', arguments);
    //         }
    //     };
    // }

    return {ServiceClass: WidgetService};
});