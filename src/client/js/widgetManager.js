/*global
 define, require
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'promise',
    'kb_widgetAdapters_objectWidget',
    'kb_widgetAdapters_kbWidget'
],
    function (Promise, widgetAdapter, KBWidgetAdapter) {
        'use strict';

        function factory(config) {
            // Variables
            // The widget registry is a db (map) of widget definitions.
            // Note that we do NOT YET store widget instance references ...
            var widgets = {},
                runtime = config.runtime;

            // Functions

            // API Functions

            function addWidget(widgetDef) {
                if (widgets[widgetDef.id]) {
                    throw new Error('Widget ' + widgetDef.id + ' is already registered');
                }
                /* TODO:  validate the widget ...*/
                widgets[widgetDef.id] = widgetDef;
            }
            function getWidget(widgetId) {
                return widgets[widgetId];
            }

            function makeFactoryWidget(widget, config) {
                return new Promise(function (resolve, reject) {
                    require([widget.module], function (factory) {
                        if (factory.make === undefined) {
                            reject('Factory widget does not have a "make" method: ' + widget.id + ', ' + widget.module);
                        }
                        try {
                            resolve(factory.make(config));
                        } catch (ex) {
                            reject(ex);
                        }
                    });
                });
            }

            function makeObjectWidget(widget, config) {
                return Promise.try(function () {
                    config.config = widget;
                    return widgetAdapter.make(widget, config);
                });
            }

            function makeKbWidget(widget, config) {
                return Promise.try(function () {
                    config = {
                        runtime: runtime,
                        widget: {
                            module: widget.module,
                            jquery_object: config.jqueryName,
                            panel: config.panel,
                            title: widget.title
                        }
                    };
                    return KBWidgetAdapter.make(config);
                });
            }

            function makeWidget(widgetId, config) {
                config = config || {};
                console.log('Mmmmaking widget with');
                console.log(config);
                config.runtime = runtime;
                var widget = widgets[widgetId];
                if (!widget) {
                    throw new Error('Widget ' + widgetId + ' not found');
                }

                // How we create a widget depends on what type it is.
                switch (widget.type) {
                    case 'factory':
                        return makeFactoryWidget(widget, config);
                    case 'object':
                        return makeObjectWidget(widget, config);
                    case 'kbwidget':
                        return makeKbWidget(widget, config);
                    default:
                        throw new Error('Unsupported widget type ' + widget.type);
                }

            }


            // API
            return {
                addWidget: addWidget,
                getWidget: getWidget,
                makeWidget: makeWidget
            };
        }

        return {
            make: function (config) {
                return factory(config);
            }
        };
    });