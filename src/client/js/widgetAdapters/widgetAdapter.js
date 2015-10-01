/*global
 define, require
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'promise',
    'underscore',
    'kb_common_html',
    'kb_common_dom'
], function (Promise, _, html, dom) {
    'use strict';
    
        function adapter(config) {
            var widget, mount, container, initConfig, 
                runtime = config.runtime,
                module = config.module;

            function init(cfg) {
                return new Promise(function (resolve) {
                    require([module], function (Widget) {
                        if (!Widget) {
                            throw new Error('Widget module did not load properly (undefined) for ' + config.module);
                        }
                        // NB we save the config, because the internal widget 
                        // unfortunately requires the container in init, and 
                        // that is not available until attach...
                        initConfig = cfg || {};
                        widget = Object.create(Widget);
                        resolve();
                    });
                });
            }
            function attach(node) {
                return new Promise(function (resolve) {
                    mount = node;
                    container = dom.createElement('div');
                    mount.appendChild(container);
                    resolve();
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
                    var widgetConfig = config.config || params || {};
                    _.extend(widgetConfig, initConfig);
                    widgetConfig.container = container;
                    widgetConfig.userId = runtime.getService('session').getUsername;
                    widgetConfig.runtme = runtime;
                    widget.init(widgetConfig);
                    widget.go();
                    
                    resolve();
                });
            }
            function stop() {
                return new Promise(function (resolve) {
                    widget.stop();
                    resolve();
                });
            }
            function detach() {
                return new Promise(function (resolve) {
                    mount.removeChild(container);
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