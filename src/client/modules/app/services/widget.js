/*global define */
/*jslint white: true */
define([
    'promise',
    'kb_widget/widgetManager'
], function (Promise, widgetManagerFactory) {
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

    function factory(config) {
        var widgetManager = widgetManagerFactory.make({runtime: config.runtime});

        function start() {
            return true;
        }
        function stop() {
            return true;
        }
        function pluginHandler(widgetsConfig, pluginConfig) {
            return Promise.try(function () {
                widgetsConfig.forEach(function (widgetDef) {
                    // If source modules are not specified, we are using module
                    // paths. A full path will start with "plugins/" and a relative
                    // path won't. Prefix a relative path with the plugin's module path.
                    if (!pluginConfig.usingSourceModules) {
                        if (!widgetDef.module.match(/^plugins\//)) {
                            widgetDef.module = [pluginConfig.moduleRoot, widgetDef.module].join('/');
                        }
                    }
                    widgetManager.addWidget(widgetDef);
                });
            });
        }
        return {
            // lifecycle interface
            start: start,
            stop: stop,
            // plugin interface
            pluginHandler: pluginHandler,
            makeWidget: function () {
                return proxyMethod(widgetManager, 'makeWidget', arguments);
            },
            getWidget: function () {
                return proxyMethod(widgetManager, 'getWidget', arguments);
            }
        };
    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
});