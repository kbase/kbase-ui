/*global
 define, console
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'bluebird',
    'kb_common_html',
    'kb/widget/widgetSet'
],
    function (Promise, html, WidgetSet) {
        'use strict';
        function widget(config) {
            var mount, container, $container,
                runtime = config.runtime,
                widgetSet = WidgetSet.make({
                    runtime: runtime
                });

            function renderTypePanel(params) {
                return new Promise(function (resolve) {
                    // Render panel
                    var div = html.tag('div');
                    var panel = div({class: 'kbase-view kbase-spec-view container-fluid', 'data-kbase-view': 'spec'}, [
                        div({class: 'row'}, [
                            div({class: 'col-sm-12'}, [
                                div({id: widgetSet.addWidget('typeView_moduleSpecification')})
                            ])
                        ])
                    ]);
                    resolve({
                        title: 'Module Specification',
                        content: panel
                    });
                });
            }

            function init(config) {
                return Promise.try(function () {
                });
            }
            function attach(node) {
                return Promise.try(function () {
                    mount = node;
                    container = document.createElement('div');
                    mount.appendChild(container);
                    $container = $(container);
                });
            }
            function start(params) {
                return renderTypePanel(params)
                    .then(function (rendered) {
                        container.innerHTML = rendered.content;
                        runtime.send('ui', 'setTitle', rendered.title);

                        return widgetSet.init()
                            .then(function () {
                                return widgetSet.attach();
                            })
                            .then(function () {
                                return widgetSet.start(params);
                            });
                    });
            }
            function stop() {
                return widgetSet.stop();
            }
            function detach() {
                return widgetSet.detach();
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