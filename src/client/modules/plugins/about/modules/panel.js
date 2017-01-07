/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'promise',
    'kb/common/html',
    'kb/common/dom'
], function(Promise, html, dom) {
    'use strict';
    var t = html.tag,
        h1 = t('h1'),
        p = t('p'),
        div = t('div'),
        a = t('a');

    /*
     * The widget factory function implements the widget interface.
     */
    function widget(config) {
        var mount, container,
            runtime = config.runtime;

        function greeting() {
            return p('Hello');
        }

        function render() {
            return [
                h1('About KBase'),
                div([
                    greeting(),
                    p(['This is KBase, the ...'])
                ])
            ];
        }
        // Widget API
        function attach(node) {
            return Promise.try(function() {
                mount = node;
                container = mount.appendChild(document.createElement('div'));
            });
        }

        function detach() {
            return Promise.try(function() {
                mount.removeChild(container);
                container = null;
            });
        }

        function start() {
            return Promise.try(function() {
                runtime.send('ui', 'setTitle', 'About then FUNctional Site');
                runtime.send('ui', 'render', {
                    node: container,
                    content: html.flatten(render())
                });
            });
        }

        function stop() {
            return Promise.try(function() {
                runtime.send('ui', 'setTitle', 'Leaving about...');
            });
        }

        return {
            attach: attach,
            detach: detach,
            start: start,
            stop: stop
        };
    }

    return {
        make: function(config) {
            return widget(config);
        }
    };

});