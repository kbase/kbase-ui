/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'bluebird',
    'kb_common/html',
    'kb_widget/widgetSet'
],
    function (Promise, html, WidgetSet) {
        'use strict';

        function widget(config) {
            var mount, container,
                runtime = config.runtime,
                widgetSet = WidgetSet.make({runtime: runtime});

            function renderPanel(params) {
                return new Promise(function (resolve) {
                    // Render panel
                    var div = html.tag('div');
                    var panel = div({class: 'kbase-view kbase-user-page-view container-fluid', 'data-kbase-view': 'social'}, [
                        div({class: 'row'}, [
                            div({class: 'col-sm-9'}, [
                                div({id: widgetSet.addWidget('kb_userProfile_profileEditor')})
                            ]),
                            div({class: 'col-sm-3'}, [
                                div({id: widgetSet.addWidget('kb_userProfile_userSearch')})
                            ])
                        ]),
                        div({class: 'row'}, [
                            div({class: 'col-sm-6'}, [
                                div({id: widgetSet.addWidget('kb_userProfile_narrativeBrowser')})
                            ]),
                            div({class: 'col-sm-6'}, [
                                div({id: widgetSet.addWidget('kb_userProfile_collaboratorNetwork')})
                            ])
                        ])
                    ]);
                    resolve({
                        title: runtime.service('session').getUsername(),
                        content: panel
                    });
                });
            }

            // API 
            function attach(node) {
                return Promise.try(function () {
                    mount = node;
                    container = document.createElement('div');
                    mount.appendChild(container);
                    return renderPanel()
                        .then(function (rendered) {
                            container.innerHTML = rendered.content;
                            runtime.send('ui', 'setTitle', rendered.title);
                            // create widgets.
                            return widgetSet.init();
                        })
                        .then(function () {
                            return widgetSet.attach(container);
                        });
                });
            }
            function start(params) {
                return widgetSet.start(params);
            }
            function stop() {
                return widgetSet.stop();
            }
            function detach() {
                return widgetSet.detach();
            }
            return {
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