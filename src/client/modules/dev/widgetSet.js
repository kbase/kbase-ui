/*global
 define, console
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'kb_common_html',
    'kb_common_dom',
    'bluebird'
], function (html, dom, Promise) {
    'use strict';

    function factory(cfg) {

        var widgets = [],
            config = cfg || {},
            runtime = config.runtime;

        if (!runtime) {
            throw {
                type: 'ArgumentError',
                reason: 'RuntimeMissing',
                name: 'RuntimeMissing',
                message: 'The rumtime argument was not provided',
                suggestion: 'This is a programmer error, not your fault.'
            };
        }

        function eachArrays(arrays, fun) {
            var len = arrays[0].length,
                i, j, temp;
            for (i = 0; i < len; i += 1) {
                temp = [];
                for (j = 0; j < arrays.length; j += 1) {
                    temp.push(arrays[j][i]);
                }
                fun(temp);
            }
        }
        function mapArrays(arrays, fun) {
            var result = [],
                len = arrays[0].length,
                i, j, temp;
            for (i = 0; i < len; i += 1) {
                temp = [];
                for (j = 0; j < arrays.length; j += 1) {
                    temp.push(arrays[j][i]);
                }
                result.push(fun(temp));
            }
            return result;
        }

        function addWidget(widgetId, config) {
            config = config || {};
            var widgetDef = runtime.getService('widget').getWidget(widgetId),
                widgetMaker = runtime.getService('widget').makeWidget(widgetId, config),
                id = html.genId(),
                rec = {
                    id: id,
                    name: widgetDef.name || widgetDef.id,
                    title: widgetDef.title,
                    widgetMaker: widgetMaker
                };
            widgets.push(rec);
            return id;
        }

        function addWidgets(widgetIds, config) {
            widgetIds.map(function (widgetId) {
                return addWidget(widgetId, config);
            });
        }

        function makeWidgets() {
            return Promise.all(widgets.map(function (rec) {
                return rec.widgetMaker;
            }))
                .then(function (results) {
                    // now we have the widget instance list.
                    eachArrays([widgets, results], function (recs) {
                        var res = recs[1];
                        recs[0].widget = res;
                    });
                });
        }

        function init(config) {
            return makeWidgets()
                .then(function () {
                    return Promise.all(widgets.map(function (rec) {
                        if (rec.widget.init) {
                            return rec.widget.init(config);
                        }
                    }));
                });
        }

        function attach() {
            return Promise.all(widgets.map(function (rec) {
                // find node by id.
                if (!rec.node) {
                    rec.node = dom.findById(rec.id);
                }
                if (!rec.node) {
                    throw {
                        type: 'WidgetError',
                        reason: 'MissingAttachmentNode',
                        message: 'The widget ' + rec.title + ' does not have a valid node at ' + rec.id
                    };
                }
                console.log('ATTACH');
                console.log(rec);
                return rec.widget.attach(rec.node);
            }));
        }

        function start(params) {
            return Promise.all(widgets.map(function (rec) {
                if (rec.widget && rec.widget.start) {
                    return rec.widget.start(params);
                }
            }));
        }

        function run(params) {
            return Promise.all(widgets.map(function (rec) {
                if (rec.widget && rec.widget.run) {
                    return rec.widget.run(params);
                }
            }).filter(function (next) {
                if (next) {
                    return true;
                }
                return false;
            }));
        }

        function stop() {
            return Promise.all(widgets.map(function (rec) {
                if (rec.widget && rec.widget.stop) {
                    return rec.widget.stop();
                }
            }));
        }

        function detach() {
            return Promise.all(widgets.map(function (rec) {
                if (rec.widget && rec.widget.detach) {
                    return rec.widget.detach();
                }
            }).filter(function (next) {
                if (next) {
                    return true;
                }
                return false;
            }));
        }

        function destroy() {
            return Promise.all(widgets.map(function (rec) {
                if (rec.widget && rec.widget.destroy) {
                    return rec.widget.destroy();
                }
            }));
        }

        return {
            addWidget: addWidget,
            addWidgets: addWidgets,
            makeWidgets: makeWidgets,
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
            return factory(config);
        }
    };
});