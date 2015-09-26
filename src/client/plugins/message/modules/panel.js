/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'kb_common_html', 
    'bluebird'
], 
function (html, Promise) {
    'use strict';

    function widget(config) {
        var mount, container;

        function render() {
            var h1 = html.tag('h1'),
                p = html.tag('p'),
                div = html.tag('div');
            return div([
                h1('MESSAGE'),
                p('message here')
            ]);
        }

        function init(config) {
            return new Promise(function (resolve) {
                resolve();
            });
        }

        function attach(node) {
            return new Promise(function (resolve) {
                mount = node;
                container = document.createElement('div');
                mount.appendChild(container);
                container.innerHTML = render();
                resolve();
            });
        }
        function start() {
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
                mount.removeChild(container);
                resolve();
            });
        }

        return {
            init: init,
            attach: attach,
            start: start,
            stop: stop,
            detach: detach
        };
    }

    return {
        make: function (config) {
            return widget(config);
        }
    };
});
