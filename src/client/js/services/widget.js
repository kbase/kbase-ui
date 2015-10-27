/*global define */
/*jslint white: true */
define([
    'promise',
    'kb_common_widgetManager'
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
        var widgetManager = widgetManagerFactory.make({runtime: config.runtime}),
            runtime = config.runtime;

        function start() {
            return true;
        }
        function stop() {
            return true;
        }
        function installWidgets(pluginConfig) {
            return Promise.try(function () {
                pluginConfig.forEach(function (widgetDef) {
                    widgetManager.addWidget(widgetDef);
                });
            });
        }
        return {
            // lifecycle interface
            start: start,
            stop: stop,
            // plugin interface
            pluginHandler: installWidgets,
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