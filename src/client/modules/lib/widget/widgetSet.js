define(['bluebird', 'kb_lib/html'], function (Promise, html) {
    'use strict';

    function eachArrays(arrays, fun) {
        const len = arrays[0].length;
        for (let i = 0; i < len; i += 1) {
            const temp = [];
            for (let j = 0; j < arrays.length; j += 1) {
                temp.push(arrays[j][i]);
            }
            fun(temp);
        }
    }

    class WidgetSet {
        constructor(config) {
            if (!config.widgetManager) {
                throw new Error('Widget manager not available; provide as "widgetManager"');
            }
            this.widgetManager = config.widgetManager;

            this.widgets = [];
            this.config = config;
        }

        addWidget(widgetId, config) {
            const widgetConfig = config || {};
            const widgetDef = this.widgetManager.getWidget(widgetId);
            const widgetMaker = this.widgetManager.makeWidget(widgetId, widgetConfig),
                id = html.genId(),
                rec = {
                    id: id,
                    name: widgetDef.name || widgetDef.id,
                    title: widgetDef.title,
                    widgetMaker: widgetMaker
                };
            this.widgets.push(rec);
            return id;
        }

        addWidgets(widgetIds, config) {
            widgetIds.map((widgetId) => {
                return this.addWidget(widgetId, config);
            });
        }

        makeWidgets() {
            return Promise.all(
                this.widgets.map((rec) => {
                    return rec.widgetMaker;
                })
            ).then((results) => {
                // now we have the widget instance list.
                eachArrays([this.widgets, results], (recs) => {
                    recs[0].widget = recs[1];
                });
            });
        }

        // LIFECYCLE API
        init(config) {
            return this.makeWidgets().then(() => {
                return Promise.all(
                    this.widgets.map((widgetWrapper) => {
                        if (widgetWrapper.widget.init) {
                            return widgetWrapper.widget.init(config);
                        }
                    })
                );
            });
        }

        attach() {
            return Promise.all(
                this.widgets.map((widgetWrapper) => {
                    // find node by id.
                    if (!widgetWrapper.widget.attach) {
                        console.warn('no attach method', widgetWrapper);
                        return;
                    }
                    if (!widgetWrapper.node) {
                        widgetWrapper.node = document.getElementById(widgetWrapper.id);
                    }
                    if (!widgetWrapper.node) {
                        throw {
                            type: 'WidgetError',
                            reason: 'MissingAttachmentNode',
                            message:
                                'The widget ' +
                                widgetWrapper.title +
                                ' does not have a valid node at ' +
                                widgetWrapper.id
                        };
                    }
                    return widgetWrapper.widget.attach(widgetWrapper.node);
                })
            );
        }

        start(params) {
            return Promise.all(
                this.widgets.map((widgetWrapper) => {
                    if (widgetWrapper.widget && widgetWrapper.widget.start) {
                        return widgetWrapper.widget.start(params);
                    }
                })
            );
        }

        run(params) {
            return Promise.all(
                this.widgets
                    .map((widgetWrapper) => {
                        if (widgetWrapper.widget && widgetWrapper.widget.run) {
                            return widgetWrapper.widget.run(params);
                        }
                    })
                    .filter((next) => {
                        return next ? true : false;
                    })
            );
        }

        stop() {
            return Promise.all(
                this.widgets.map((widgetWrapper) => {
                    if (widgetWrapper.widget && widgetWrapper.widget.stop) {
                        return widgetWrapper.widget.stop();
                    }
                })
            );
        }

        detach() {
            return Promise.all(
                this.widgets
                    .map((widgetWrapper) => {
                        if (widgetWrapper.widget && widgetWrapper.widget.detach) {
                            return widgetWrapper.widget.detach();
                        }
                    })
                    .filter((next) => {
                        return next ? true : false;
                    })
            );
        }

        destroy() {
            return Promise.all(
                this.widgets.map((widgetWrapper) => {
                    if (widgetWrapper.widget && widgetWrapper.widget.destroy) {
                        return widgetWrapper.widget.destroy();
                    }
                })
            );
        }
    }

    return { WidgetSet };
});
