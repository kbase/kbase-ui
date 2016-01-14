/*global define */
/*jslint white: true, browser: true */
define([
    'kb/common/dom',
    'kb/common/html'
],
    function (dom, html) {
        'use strict';
        
        function factory(config) {
            var mount, container;
          
            function init(config) {
                return new Promise(function (resolve) {
                    resolve();
                });
            }
            function attach(node) {
                return new Promise(function (resolve) {
                    mount = node;
                    container = dom.createElement('div');
                    dom.append(mount, container);
                    resolve();
                });
            }
            function start(params) {
                return new Promise(function (resolve) {
                    container.innerHTML = 'MENU';
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
                    mount.innerHTML = '';
                    container = null;
                    mount = null;
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
            }
        }
        return {
            make: function (config) {
                return factory(config);
            }
        };
    });
