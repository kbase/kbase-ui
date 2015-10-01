/*global
 define, require, console, document
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'jquery',
    'bluebird',
    'kb.service.workspace',
    'kb.html',
    'kb.runtime',
    'kb.utils.api',
    'kb_types',
    'kb.widget.kbwidgetadapter'
],
    function ($, Promise, Workspace, html, R, APIUtils, Types, KBWidgetAdapter) {
        "use strict";


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

        // Returns id for the 
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

        function makeWidget(params) {
            // Translate and normalize params.
            params.objectVersion = params.ver;

            // Get other params from the runtime.
            // params.workspaceURL = R.getConfig('services.workspace.url');
            // params.authToken = R.getAuthToken();

            return new Promise(function (resolve, reject) {
                var workspace = new Workspace(R.getConfig('services.workspace.url'), {
                    token: R.getAuthToken()
                }),
                    objectRefs = [{ref: params.workspaceId + '/' + params.objectId}];
                Promise.resolve(workspace.get_object_info_new({
                    objects: objectRefs,
                    ignoreErrors: 1,
                    includeMetadata: 1
                }))
                    .then(function (data) {
                        if (data.length === 0) {
                            reject('Object not found');
                            return;
                        }
                        if (data.length > 1) {
                            reject('Too many (' + data.length + ') objects found.');
                            return;
                        }
                        if (data[0] === null) {
                            reject('Null object returned');
                            return;
                        }

                        var wsobject = APIUtils.object_info_to_object(data[0]);
                        var type = APIUtils.parseTypeId(wsobject.type),
                            mapping = findMapping(type, params);
                        if (!mapping) {
                            reject('Not Found', 'Sorry, cannot find widget for ' + type.module + '.' + type.name);
                            return;
                        }

                        // These params are from the found object.
                        var widgetParams = {
                            workspaceId: params.workspaceId,
                            objectId: params.objectId,
                            objectName: wsobject.name,
                            workspaceName: wsobject.ws,
                            objectVersion: wsobject.version,
                            objectType: wsobject.type,
                            type: wsobject.type
                        };
                       

                        // Create params.
                        if (mapping.options) {
                            mapping.options.forEach(function (item) {
                                var from = widgetParams[item.from];
                                if (!from && item.optional !== true) {
                                    // console.log(params);
                                    throw 'Missing param, from ' + item.from + ', to ' + item.to;
                                }
                                widgetParams[item.to] = from;
                            });
                        }
                        // Handle different types of widgets here.
                        var type = mapping.type || 'kbwidget';
                        switch (type) {
                            case 'kbwidget':
                                var w = KBWidgetAdapter.make({
                                    module: mapping.module,
                                    // TODO: don't actually know how the jquery object is specified in the mapping
                                    jquery_object: mapping.jquery_object || mapping.widget,
                                    panel: mapping.panel,
                                    title: mapping.title
                                });
                                resolve({
                                    widget: w,
                                    params: widgetParams
                                });
                                break;
                                // case 'widgetBase':
                            case 'widgetBase':
                                // The widgetBase type is based on standard prototypal
                                // object inheritance and ES5 object building.
                                // The object (perhaps via prototypes) is expected
                                // to itself implement the widget api...
                                require([mapping.module], function (W) {
                                    resolve({
                                        widget:  Object.create(W),
                                        params: widgetParams
                                    })
                                });
                                break;
                            case 'widgetFactory':
                                require([mapping.module], function (W) {
                                    resolve({
                                        widget: W.make(),
                                        params: widgetParams
                                    });
                                });
                                break;
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
        function genericVisualizerWidgetFactory() {
            var mount, container, $container, config;
            var theWidget;
            
            function showError(err) {
                var content;

                if (typeof err === 'string') {
                    content = err;
                } else if (err.message) {
                    content = err.message;
                } else if (err.error && err.error.error) {
                    content = err.error.error.message;
                } else {
                    content = 'Unknown Error';
                }
                container.innerHTML = html.bsPanel('Error', content);
            }

            // Widget Lifecycle Interface

            function init(cfg) {
                return new Promise(function (resolve) {
                    config = cfg;
                    resolve();
                });
            }
            function attach(node) {
                return new Promise(function (resolve) {
                    mount = node;
                    container = document.createElement('div');
                    $container = $(container);
                    mount.appendChild(container);
                    resolve();
                });
            }

            function start(params) {
                return new Promise(function (resolve, reject) {
                    var newParams;
                    makeWidget(params)
                        .then(function (result) {
                            theWidget = result.widget;
                            newParams = result.params;
                            if (theWidget.init) {
                                return theWidget.init(config);
                            } else {
                                return null;
                            }
                        })
                        .then(function () {
                            return theWidget.attach(container);
                        })
                        .then(function () {
                            return theWidget.start(newParams);
                        })
                        .then(function () {
                            // do nothing...
                        })
                        .catch(function (err) {
                            // if attaching the widget failed, we attach a 
                            // generic error widget:
                            // TO BE DONE
                            showError(err);
                            reject(err);
                        })
                        .done();
                });
            }
            function stop() {
                return new Promise(function (resolve, reject) {
                    if (theWidget && theWidget.stop) {
                        theWidget.stop()
                            .then(function () {
                                resolve();
                            })
                            .catch(function (err) {
                                reject(err);
                            })
                            .done();
                    } else {
                        resolve();
                    }
                });
            }
            function detach() {
                return new Promise(function (resolve, reject) {
                     if (theWidget && theWidget.detach) {
                        theWidget.detach()
                            .then(function () {
                                resolve();
                            })
                            .catch(function (err) {
                                reject(err);
                            })
                            .done();
                    } else {
                        resolve();
                    }
                });
            }
            function destroy() {
                return new Promise(function (resolve) {
                     if (theWidget && theWidget.destroy) {
                        theWidget.destroy()
                            .then(function () {
                                resolve();
                            })
                            .catch(function (err) {
                                reject(err);
                            })
                            .done();
                    } else {
                        resolve();
                    }
                });
            }

            return {
                init: init,
                attach: attach,
                start: start,
                stop: stop,
                detach: detach,
                destroy: destroy
            };
        }

        return {
            create: function () {
                return genericVisualizerWidgetFactory();
            }
        };
    });

