/*global define, Promise */
/*jslint
 browser: true,
 white: true
 */
define([
    'promise',
    'kb_common/html',
    'kb_common/dom'
],
    function (Promise, html, dom) {
        'use strict';

        function widget(config) {
            var mount, container, runtime = config.runtime;

            function render() {
                var h1 = html.tag('h1'),
                    p = html.tag('p'),
                    div = html.tag('div');
                return div([
                    h1('Welcome to KBase'),
                    p('This is KBase')
                ]);
            }

            function init() {
                return Promise.try(function () {
                });
            }

            function attach(node) {
                return Promise.try(function () {
                    mount = node;
                    container = dom.createElement('div');
                    mount.appendChild(container);
                    container.innerHTML = render();
                });
            }
            function start() {
                return Promise.try(function () {
                    runtime.send('ui', 'setTitle', 'Welcome to KBase');
                });
            }
            function stop() {
                return Promise.try(function () {
                });
            }
            function detach() {
                return Promise.try(function () {
                    mount.removeChild(container);
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