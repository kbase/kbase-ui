define(['bluebird'], function (Promise) {
    'use strict';

    class WidgetManager {
        constructor({runtime}) {
            if (!runtime) {
                throw new Error('WidgetManager requires a runtime argument; pass as "runtime"');
            }
            this.runtime = runtime;

            this.widgets = {};
        }

        addWidget(widgetDef) {
            if (widgetDef.id) {
                widgetDef.name = widgetDef.id;
            }
            if (this.widgets[widgetDef.name]) {
                throw new Error('Widget ' + widgetDef.name + ' is already registered');
            }
            /* TODO:  validate the widget ...*/
            this.widgets[widgetDef.name] = widgetDef;
        }

        getWidget(widgetId) {
            return this.widgets[widgetId];
        }

        makeES6Widget(widget, config) {
            return new Promise((resolve, reject) => {
                var required = [widget.module];
                if (widget.css) {
                    required.push('css!' + widget.module + '.css');
                }
                require(required, (module) => {
                    let Widget;
                    if (module.Widget) {
                        Widget = module.Widget;
                    } else {
                        Widget = module;
                    }
                    if (typeof Widget === 'undefined') {
                        reject(new Error('Widget class is undefined for ' + widget.module));
                    } else {
                        try {
                            resolve(new Widget(config));
                        } catch (ex) {
                            console.error('ERROR!!', widget, ex);
                            reject(ex);
                        }
                    }
                }, (error) => {
                    console.error('ERROR???', error);
                    reject(error);
                });
            });
        }

        validateWidget(widget, name) {
            var message;
            if (typeof widget !== 'object') {
                message = 'Invalid widget after making: ' + name;
            }

            if (message) {
                console.error(message);
                console.error(widget);
                throw new Error(message);
            }
        }

        makeWidget(widgetName, config) {
            const widgetDef = this.widgets[widgetName];
            if (!widgetDef) {
                throw new Error('Widget ' + widgetName + ' not found');
            }

            let widgetPromise;

            const widgetConfig = Object.assign({}, config);

            widgetConfig.runtime = this.runtime;

            // How we create a widget depends on what type it is.
            switch (widgetDef.type) {
            case 'es6':
                widgetPromise = this.makeES6Widget(widgetDef, widgetConfig);
                break;
            default:
                throw new Error('Unsupported widget type ' + widgetDef.type);
            }
            return widgetPromise.then((widget) => {
                this.validateWidget(widget, widgetName);
                return widget;
            });
        }
    }

    return { WidgetManager };
});
