/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'bluebird',
    'kb_common/dom',
    'kb_common/html',
    'kb_widget/widgetSet'
], function (Promise, DOM, html, WidgetSet) {
    'use strict';
    function widget(config) {
        var mount, container, runtime = config.runtime,
            widgetSet = WidgetSet.make({runtime: runtime}),
            layout;

        // Mini widget manager
        // TODO: the jquery name should be stored in the widget definition not here.
        function render() {

            // the catalog home page is simple the catalog browser
            var div=html.tag('div');
            return div({
                id: widgetSet.addWidget('catalog_service_widget', 
                    {
                        jqueryName: 'KBaseCatalogService', 
                        jquery_name:'KBaseCatalogService'
                    })
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
            runtime.send('ui', 'setTitle', 'Service Catalog');
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
            runtime.send('ui', 'setTitle', '');
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