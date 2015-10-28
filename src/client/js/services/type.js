/*global define */
/*jslint white: true */
define([
    'promise',
    'kb_common_typeManager',
    'require'
], function (Promise, TypeManager, require) {
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
        var runtime = config.runtime,
            typeManager = TypeManager.make({
                runtime: runtime,
                typeDefs: {}
            });

        function start() {
            return new Promise(function (resolve) {
//                require(['yaml!' + Plugin.plugin.path + '/data_types.yml'], function (typeDefs) {
//                    typeManager = TypeManager.make({
//                        runtime: config.runtime,
//                        typeDefs: typeDefs
//                    });
//                    console.log('created type manager');
//                    resolve();
//                });
                resolve();
            });
        }
        function stop() {
            return true;
        }
        function pluginHandler(pluginConfig) {
            if (!pluginConfig) {
                return;
            }
            console.log('TYPES: plugin config');
            console.log(pluginConfig);
            return Promise.all(pluginConfig.map(function (typeDef) {
                console.log('TYPES: adding');
                console.log(typeDef);
                var type = typeDef.type,
                    viewers = typeDef.viewers,
                    icon = typeDef.icon;

                if (icon) {
                    typeManager.setIcon(type, icon);
                }

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
            parseTypeId: function () {
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