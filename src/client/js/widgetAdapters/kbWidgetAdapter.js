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
    'kb_common_html'
], function ($, _, Promise, html) {
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
            var mount, container, $container, runtime = config.runtime;
            var module = config.widget.module;            
            var jqueryObjectName = config.widget.jquery_object;
            var wantPanel = config.widget.panel;
            var title = config.widget.title;
            var theWidget;

            function init(initConfig) {
                
                return new Promise(function (resolve, reject) {
                    require([module], function () {
                        // these are jquery widgets, so they are just added to the
                        // jquery namespace.
                        // TODO: throw error if not found...
                        
                        resolve();
                    }, function (err) {
                        reject(err);
                    });
                });
            }
            function attach(node) {
                console.log('ATTACHING with ');
                console.log(node);
                return new Promise(function (resolve, reject) {
                    mount = node;
                    container = document.createElement('div');
                    mount.appendChild(container);
                    
                    if (wantPanel) {
                        $container = createBSPanel($(container), title);
                    } else {
                        $container = $(container);
                    }
                    
                    console.log('kb widget adapter testing jquery widget on ');
                    console.log(container);
                    console.log(node);
                    
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
                        ws_url: runtime.getConfig('services.workspace.url'),
                        token: runtime.getService('session').getAuthToken(),
                        runtime: runtime
                    });
                     console.log('kb widget adapter invoking jquery widget on ');
                    console.log(container);
                    theWidget = $container[jqueryObjectName](widgetConfig);
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