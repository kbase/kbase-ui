/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'bluebird',
    'kb/common/dom',
    'kb/common/html',
    'kb/widget/widgetSet'
], function (Promise, DOM, html, WidgetSet) {
    'use strict';
    function widget(config) {
        var mount, container, runtime = config.runtime,
            widgetSet = WidgetSet.make({runtime: runtime}),
            layout;

        // Mini widget manager
        // TODO: the jquery name should be stored in the widget definition not here.
        function render() {
            var div = html.tag('div'),
                p = html.tag('p');
            return html.makePanel({
                title: 'Narrative Apps and Methods Documentation',
                content: div({id: widgetSet.addWidget('narrativeStore_viewer', {
                        jqueryName: 'KBaseNarrativeStoreView',
                        jquery_name: 'KBaseNarrativeStoreView'
                    })})
            });
        }

        layout = render();

        // Widget Interface Implementation

        function init(config) {
            return Promise.try(function () {
                return widgetSet.init(config);
            });
        }
        function attach(node) {
            return Promise.try(function () {
                mount = node;
                container = mount.appendChild(DOM.createElement('div'));
                container.innerHTML = layout;
                // mount.appendChild(container);
                return widgetSet.attach();
            });
        }
        function start(params) {
            return Promise.try(function () {
                return widgetSet.start(params);
            });
        }
        function run(params) {
            return Promise.try(function () {
                return widgetSet.run(params);
            });
        }
        function stop() {
            return Promise.try(function () {
                return widgetSet.stop();
            });
        }
        function detach() {
            return Promise.try(function () {
                return widgetSet.detach();
            });
        }
        function destroy() {
            return Promise.try(function () {
                return widgetSet.destroy();
            });
        }

        // Widget Interface
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
            return widget(config);
        }
    };

});