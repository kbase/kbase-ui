/*global
 define, require
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'jquery',
    'underscore',
    'bluebird',
    'kb.runtime',
    'kb.html'
], function ($, _, Promise, R, html) {
    'use strict';
    
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
                    // The config is supplied by the caller, but we add 
                    // standard properties here.
                    /* TODO: be more generic */
                    // But then again, a widget constructed on this model does
                    // not need a connector!
                    // not the best .. perhaps merge the params into the config
                    // better yet, rewrite the widgets in the new model...
                    var widgetConfig = _.extendOwn({}, params, {
                        // Why this?
                        wsNameOrId: params.workspaceId,
                        objNameOrId: params.objectId,
                        // commonly used, but really should remove this.
                        /* TODO: remove default params like this */
                        ws_url: R.getConfig('services.workspace.url'),
                        token: R.getAuthToken()
                    });
                    $container[jqueryObjectName](widgetConfig);
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