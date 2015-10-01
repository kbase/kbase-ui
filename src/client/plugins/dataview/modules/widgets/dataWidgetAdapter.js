/*global
 define, require
 */
/*jslint
 browser: true,
 white: true
 */
/*
 * This is different than the regular kbaseKbWidgetAdapter because it 
 * can only know about the jquery widget in the start phase ... this is because
 * it must query the workspace using the params in order to get the type 
 * of the requested object.
 * 
 */
define([
    'jquery',
    'underscore',
    'bluebird',
    'kb.runtime',
    'kb.html',
    'kb.service.workspace',
    'kb.utils.api',
    'kb_types'
], function ($, _, Promise, R, html, Workspace, APIUtils, Types) {
    'use strict';
    
        function findMapping(type, params) {
            // var mapping = typeMap[objectType];
            var mapping = Types.getViewer({type: type});
            if (mapping) {
                if (params.sub && params.subid) {
                    if (mapping.sub) {
                        if (mapping.sub.hasOwnProperty(params.sub)) {
                            mapping = mapping.sub[params.sub]; // ha, crazy line, i know.
                        } else {
                            throw new Error('Sub was specified, but config has no correct sub handler, sub:' + params.sub + "config:");
                        }
                    } else {
                        throw new Error('Sub was specified, but config has no sub handler, sub:' + params.sub);
                    }
                    //} else {
                    //    console.error('Something was in sub, but no sub.sub or sub.subid found', params.sub);
                    //    return $('<div>');
                }
            }
            return mapping;
        }
        function makeWidget(params) {
                // Translate and normalize params.
                params.objectVersion = params.ver;

                // Get other params from the runtime.
                params.workspaceURL = R.getConfig('services.workspace.url');
                params.authToken = R.getAuthToken();

                return new Promise(function (resolve, reject) {
                    var workspaceClient = new Workspace(R.getConfig('services.workspace.url'), {
                        token: R.getAuthToken()
                    });
                    workspaceClient.getObject(params.workspaceId, params.objectId)
                        .then(function (wsobject) {
                            var type = APIUtils.parseTypeId(wsobject.type),
                                mapping = findMapping(type, params);
                            if (!mapping) {
                                reject('Not Found', 'Sorry, cannot find widget for ' + type.module + '.' + type.name);
                                return;
                            }

                            // These params are from the found object.
                            params.objectName = wsobject.name;
                            params.workspaceName = wsobject.ws;
                            params.objectVersion = wsobject.version;
                            params.objectType = wsobject.type;

                            // Create params.
                            var widgetParams = {};
                            if (mapping.options) {
                                mapping.options.forEach(function (item) {
                                    var from = params[item.from];
                                    if (!from && item.optional !== true) {
                                        // console.log(params);
                                        throw 'Missing param, from ' + item.from + ', to ' + item.to;
                                    }
                                    widgetParams[item.to] = from;
                                });
                            } else {
                                widgetParams = params;
                            }
                            // Handle different types of widgets here.
                            var type = mapping.type || 'kbwidget';
                            switch (type) {
                                case 'kbwidget':
                                    var w = KBWidgetAdapter.make({
                                        module: mapping.module,
                                        // TODO: don't actually know how the jquery object is specified in the mapping
                                        jquery_object: mapping.jquery_object
                                    });
                                    resolve(w);
                                    break;
                                    // case 'widgetBase':

                                default:
                                    reject('Invalid type ' + type + ' in widget mapping')
                            }
                        })
                        .catch(function (err) {
                            //console.log('ERROR');
                            //console.log(err);
                            reject(err);
                        })
                        .done();
                });
            }
    
        function createBSPanel($node, title) {
            var id = html.genId(),
                div = html.tag('div'),
                span = html.tag('span');
            $node.html(div({class: 'panel panel-default '}, [
                div({class: 'panel-heading'}, [
                    span({class: 'panel-title'}, title)
                ]),
                div({class: 'panel-body'}, [
                    div({id: id})
                ])
            ]));
            return $('#' + id);
        }
    
        function adapter(config) {
            var mount, container, $container;
            
            var module = config.module;            
            var jqueryObjectName = config.jquery_object;
            var wantPanel = config.panel;
            var title = config.title;

            function init() {
                return new Promise(function (resolve) {
                    // Init cannot be used to create the widget, because
                    // we don't even know what it is yet!
                    require([module], function () {
                        // these are jquery widgets, so they are just added to the
                        // jquery namespace.
                        // TODO: throw error if not found...
                        
                        resolve();
                    });
                });
            }
            function attach(node) {
                return new Promise(function (resolve, reject) {
                    // Attach can only be used to create the DOM structures to be
                    // later used. Our widget cannot be created yet because we
                    // don't yet have params.
                    mount = node;
                    container = document.createElement('div');
                    mount.appendChild(container);
                    
                    if (wantPanel) {
                        $container = createBSPanel($(container), title);
                    } else {
                        $container = $(container);
                    }
                    
                    if ($container[jqueryObjectName] === undefined) {
                        reject('Sorry, cannot find jquery widget ' + jqueryObjectName);
                    } else {                    
                        resolve();
                    }
                });
            }
            function start(params) {
                return new Promise(function (resolve) {
                    // Ah, so here we can create the widget!
                    
                    makeWidget(params)
                        .then(function (w) {
                            
                    })
                    
                    var module = config.module;            
                    var jqueryObjectName = config.jquery_object;
                    var wantPanel = config.panel;
                    var title = config.title;

                    var widgetConfig = _.extendOwn({}, params, {
                        // Why this?
                        wsNameOrId: params.workspaceId,
                        objNameOrId: params.objectId,
                        // commonly used, but really should remove this.
                        /* TODO: remove default params like this */
                        ws_url: R.getConfig('services.workspace.url'),
                        token: R.getAuthToken()
                    });
                    $(container)[jqueryObjectName](widgetConfig);
                    resolve();
                });
            }
            function run(params) {
                return new Promise(function (resolve) {
                    resolve();
                });
            }
            function stop() {
                return new Promise(function (resolve) {
                    resolve();
                });
            }
           
            function detach() {
                return new Promise(function (resolve) {
                    resolve();
                });
            }
            function destroy() {
                return new Promise(function (resolve) {
                    resolve();
                });
            }

            return {
                init: init,
                attach: attach,
                start: start,
                run: run,
                stop: stop,
                detach: detach,
                destroy: destroy
            };
        }
        
        return {
            make: function (config) {
                return adapter(config);
            }
        };
    });