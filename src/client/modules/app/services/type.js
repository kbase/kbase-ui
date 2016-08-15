/*global define */
/*jslint white: true */
define([
    'promise',
    'kb/common/typeManager'
], function (Promise, TypeManager) {
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
            //return new Promise(function (resolve) {
//                require(['yaml!' + Plugin.plugin.path + '/data_types.yml'], function (typeDefs) {
//                    typeManager = TypeManager.make({
//                        runtime: config.runtime,
//                        typeDefs: typeDefs
//                    });
//                    console.log('created type manager');
//                    resolve();
//                });
            //    resolve();
            //});
            return Promise.try(function () {
                var problems = typeManager.checkViewers(),
                    errors = [];
                if (problems.length > 0) {
                    problems.forEach(function (problem) {
                        switch (problem.severity) {
                            case 'warning': 
                                console.warn(problem.message, problem);
                                break;
                            case 'error':
                                console.error(problem.message, problem);
                                errors.push(problem.message);
                                break;
                            default:
                                console.log(problem.message, problem);
                                break;
                        }
                    });
                    if (errors.length > 0) {
                        throw new Error('Error starting Type Manager. Check the log for details. ' + errors.join('; '))
                    }
                }
                return true;
            });
        }
        function stop() {
            return Promise.try(function () {
                return true;
            });
        }
        function pluginHandler(pluginConfig) {
            if (!pluginConfig) {
                return;
            }
            return Promise.all(pluginConfig.map(function (typeDef) {
                var type = typeDef.type,
                    viewers = typeDef.viewers,
                    icon = typeDef.icon;

                if (icon) {
                    typeManager.setIcon(type, icon);
                }

                if (viewers) {
                    return Promise.all(viewers.map(function (viewerDef) {
                        return Promise.try(function () {
                            typeManager.addViewer(type, viewerDef);
                        });
                        
//                        return new Promise(function (resolve, reject) {
//                            try {
//                                typeManager.addViewer(type, viewerDef);
//                                resolve();
//                            } catch (ex) {
//                                console.log('ERROR in plugin handler for type service', ex);
//                                reject(ex);
//                            }
//                        });
                    }));
                }
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
            getColor: function () {
                return proxyMethod(typeManager, 'getColor', arguments);
            },
            makeVersion: function () {
                return proxyMethod(typeManager, 'makeVersion', arguments);
            },
            makeTypeId: function () {
                return proxyMethod(typeManager, 'makeTypeId', arguments);
            },
            makeType: function () {
                return proxyMethod(typeManager, 'makeType', arguments);
            },            
            hasType: function () {
                return proxyMethod(typeManager, 'hasType', arguments);                
            }
        };
    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
});