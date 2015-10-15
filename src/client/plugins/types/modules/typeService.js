/*global define */
/*jslint white: true */
define([
    'promise',
    'kb_types_typeManager',
    'kb_plugin_types',
    'require'
], function (Promise, TypeManager, Plugin, require) {
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
        var typeManager,
            runtime = config.runtime;

        function start() {
            return new Promise(function (resolve) {
                require(['yaml!' + Plugin.plugin.path +'/data_types.yml'], function (typeDefs) {
                    typeManager = TypeManager.make({
                        runtime: config.runtime,
                        typeDefs: typeDefs
                    });
                    resolve();
                });
            });
        }
        function stop() {
            return true;
        }
        function pluginHandler(pluginConfig) {
            return;
            
//             function installTypes(types) {
                if (!pluginConfig) {
                    return;
                }
                return Promise.all(pluginConfig.map(function (typeDef) {
                    var type = typeDef.type,
                        viewers = typeDef.viewers;
                    viewers.forEach(function (viewerDef) {
                        return new Promise(function (resolve, reject) {
                            try {                            
                                typeManager.addViewer(type, viewerDef);
                                resolve();
                            } catch (ex) {
                                console.log('ERROR in plugin handler for type service');
                                console.log(ex);
                                reject(ex);
                            }
                        });
                    });
                }));
//            }
//            
//            
//            return Promise.try(function () {
//                pluginConfig.forEach(function (widgetDef) {
//                    widgetManager.addWidget(widgetDef);
//                });
//            });
        }
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
        return {
            // lifecycle interface
            start: start,
            stop: stop,
            // plugin interface
            pluginHandler: pluginHandler,
            // API
            getViewer: function () {                
                return proxyMethod(typeManager, 'getViewer', arguments);
            },
            parseTypeId:  function () {                
                return proxyMethod(typeManager, 'parseTypeId', arguments);
            },
            getIcon: function () {                
                return proxyMethod(typeManager, 'getIcon', arguments);
            },
            makeVersion: function () {                
                return proxyMethod(typeManager, 'makeVersion', arguments);
            },
            makeTypeId: function () {                
                return proxyMethod(typeManager, 'makeTypeId', arguments);
            }
        };
    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
});