/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'jquery',
    'bluebird',
    'kb_common_html',
    'kb_widgetAdapters_widgetAdapter',
    //'kb_widgetAdapters_kbWidgetAdapter',
    'kb_widget_dataview_provenance',
    'kb_widget_dataview_download'
],
    function ($, Promise, html, widgetAdapter) {
        'use strict';

        function renderBSCollapsiblePanel(title, content) {
            var div = html.tag('div'),
                span = html.tag('span'),
                h4 = html.tag('h4');

            var panelId = html.genId(),
                headingId = html.genId(),
                collapseId = html.genId();

            return div({class: 'panel-group kb-widget', id: panelId, role: 'tablist', 'aria-multiselectable': 'true'}, [
                div({class: 'panel panel-default'}, [
                    div({class: 'panel-heading', role: 'tab', id: headingId}, [
                        h4({class: 'panel-title'}, [
                            span({'data-toggle': 'collapse', 'data-parent': '#' + panelId, 'data-target': '#' + collapseId, 'aria-expanded': 'false', 'aria-controls': collapseId, class: 'collapsed', style: {cursor: 'pointer'}}, [
                                span({class: 'fa fa-sitemap fa-rotate-90', style: {'margin-left': '10px', 'margin-right': '10px'}}),
                                title
                            ])
                        ])
                    ]),
                    div({class: 'panel-collapse collapse', id: collapseId, role: 'tabpanel', 'aria-labelledby': 'provHeading'}, [
                        div({class: 'panel-body'}, [
                            content
                        ])
                    ])
                ])
            ]);
        }

        function renderPanel(params) {
            return new Promise(function (resolve) {
                // Widgets
                var widgets = [];
                
                // These are "classic Erik" widgets, for which the widgetAdapter
                // calls them according to the new widget api.
                function addWidget(config) {
                    var id = html.genId();
                    widgets.push({
                        id: id,
                        widget: widgetAdapter.make(config)
                    });
                    return id;
                }

                // These are new (only one maybe) widgets based on the factory
                // pattern which do implement the new widget pattern.
                function addFactoryWidget(name, widget) {
                    var id = html.genId();
                    widgets.push({
                        name: name,
                        widget: widget.create(),
                        id: id
                    });
                    return id;
                }

//                function addKBWidget(config) {
//                    var id = html.genId();
//                    widgets.push({
//                        widget: kbWidgetAdapter.make(config),
//                        id: id
//                    });
//
//                    return id;
//                }

                // Render panel
                var div = html.tag('div');
                var panel = div({class: 'kbase-view kbase-dataview-view container-fluid', 'data-kbase-view': 'dataview'}, [
                    div({class: 'row'}, [
                        div({class: 'col-sm-12'}, [
                            div({id: addFactoryWidget({
                                    name: 'overview',
                                    module: 'kb_widget_dataview_overview'
                                })}),
                            //renderBSCollapsiblePanel('Data Provenance and Reference Network', div({id: addKBWidget({
                            //        name: 'provenance',
                            //        module: 'kb_widget_dataview_provenance',
                            //        jquery_object: 'KBaseWSObjGraphCenteredView'
                            //    })})),
                            html.makePanel({
                                title: 'Type Viewer Here',
                                content: 'This will be the type viewer'
                            })
                        ])
                    ])
                ]);
                resolve({
                    title: 'Dataview',
                    content: panel,
                    widgets: widgets
                });
            });
        }

        function widget(config) {
            var mount, container, children = [], runtime = config.runtime;
            
            function init(config) {
                return new Promise(function (resolve) {
                    return resolve();
                });
            }

            function attach(node) {
                return new Promise(function (resolve) {
                    mount = node;
                    container = document.createElement('div');
                    mount.appendChild(container);
                    resolve();
                });
            }
            function start(params) {
                return new Promise(function (resolve, reject) {
                    renderPanel(params)
                        .then(function (rendered) {
                            container.innerHTML = rendered.content;
                            runtime.send('ui', 'setTitle', rendered.title);
                            // create widgets.
                            children = rendered.widgets;
                            Promise.all(children.map(function (w) {
                                return w.widget.init(w.config);
                            }))
                                .then(function () {
                                    Promise.all(children.map(function (w) {
                                        return w.widget.attach($('#' + w.id).get(0));
                                    }))
                                        .then(function (results) {
                                            Promise.all(children.map(function (w) {
                                                return w.widget.start(params);
                                            }))
                                                .then(function (results) {
                                                    resolve();
                                                })
                                                .catch(function (err) {
                                                    console.log('ERROR starting');
                                                    console.log(err);
                                                })
                                                .done();
                                        })
                                        .catch(function (err) {
                                            console.log('ERROR attaching');
                                            console.log(err);
                                        })
                                        .done();
                                })
                                .catch(function (err) {
                                    console.log('ERROR creating');
                                    console.log(err);
                                })
                                .done();
                        })
                        .catch(function (err) {
                            console.log('ERROR rendering console');
                            console.log(err);
                            reject(err);
                        })
                        .done();
                });
            }
            function stop() {
                return new Promise(function (resolve) {
                    resolve();

                });
            }
            function detach() {
                return new Promise(function (resolve) {
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
