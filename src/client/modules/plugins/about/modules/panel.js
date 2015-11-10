/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'promise',
    'kb_common_html', 
    'kb_common_dom'
], 
    function (Promise, html, dom) {
    'use strict';

    /*
     * The widget factory function implements the widget interface.
     */
    function widget(config) {
        var mount, container, 
            runtime = config.runtime,
            h1 = html.tag('h1'),
            p = html.tag('p'),
            div = html.tag('div'),
            a = html.tag('a');
        
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
            return Promise.try(function () {
                mount = node;
                container = dom.createElement('div');
                mount.appendChild(container);
            });
        }
        function detach() {
            return Promise.try(function () {
                mount.removeChild(container);
                container = null;
            });
        }
        function start() {
            return Promise.try(function () {
                runtime.send('ui', 'setTitle', 'About then FUNctional Site');
                runtime.send('ui', 'render', {
                    node: container,
                    content: html.flatten(render())
                });
            });
        }
        function stop() {
             return Promise.try(function () {
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
        make: function (config) {
            return widget(config);
        }
    };
    
});
