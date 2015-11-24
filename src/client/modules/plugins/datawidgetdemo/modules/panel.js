/*global define, Promise */
/*jslint
 browser: true,
 white: true
 */
define([
    'promise',
    'kb/common/html',
    'kb/common/dom',
    'kb/widget/widgetSet'
],
    function (Promise, html, dom, WidgetSet) {
        'use strict';

        function widget(config) {
            var mount, container, runtime = config.runtime,
                widgetSet = WidgetSet.make({runtime: runtime}),
                layout;

            function render() {
                var h1 = html.tag('h1'),
                    h2 = html.tag('h2'),
                    p = html.tag('p'),
                    div = html.tag('div');
                return div([
                    h1('Data Widget Test Page'),
                    h2('Widget 1'),
                    p('This widget simply renders the programmer\'s name'),
                    div({id: widgetSet.addWidget('kb_datawidgetdemo_myDataWidget')}),
                    h2('Widget 2'),
                    p('This widget actually fetches some data, some profile data for the current user.'),
                    div({id: widgetSet.addWidget('kb_datawidgetdemo_myProfileWidget')})
                ]);
            }
            layout = render();

            function init() {
                return Promise.try(function () {
                    return widgetSet.init();
                });
            }

            function attach(node) {
                return Promise.try(function () {
                    mount = node;
                    container = dom.createElement('div');
                    mount.appendChild(container);
                    container.innerHTML = layout;
                    
                    // Make a sub-container for the child widget.
                    return widgetSet.attach(container);
                });
            }
            function start() {
                return Promise.try(function () {
                    runtime.send('ui', 'setTitle', 'Hello, Welcome to KBase');
                    return widgetSet.start();
                });
            }
            function run() {
                return Promise.try(function () {
                    return widgetSet.run();
                });
            }
            function stop() {
                return Promise.try(function () {
                    return widgetSet.stop();
                });
            }
            function detach() {
                return Promise.try(function () {
                    mount.removeChild(container);
                    return widgetSet.detach();
                });
            }

            return {
                init: init,
                attach: attach,
                start: start,
                run: run,
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