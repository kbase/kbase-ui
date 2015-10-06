/*global define */
/*jslint white: true, browser: true */
define([
    'bluebird',
    'kb_common_html',
    'kb_common_dom',
    'kb_common_domEvent',
    'vega',
    'kb_vegaChartHelper'
],
    function (Promise, html, dom, domEvent, vega, vegaChartHelper) {
        'use strict';


        function widget(config) {
            var mount, container, scatterNode, runtime = config.runtime,
                domEventManager = domEvent.make();
            function getData() {
                var i, data = [];
                for (i = 0; i < 10000; i += 1) {
                    data.push({
                        x: Math.random() * 100,
                        y: Math.random() * 100
                    });
                }
                return data;
            }
            function clickButton() {
                run()
                    .then(function () {
                        // nothing;
                    });
            }
            function attach(node) {
                return Promise.try(function () {
                    var div = html.tag('div'),
                        id = html.genId(),
                        button = html.tag('button'),
                        content = html.makePanel({
                            title: 'Vega Big Scatterplot Test',
                            content: div([
                                div({style: {borderBottom: '1px red solid'}}, [
                                    button({id: domEventManager.addEvent('click', clickButton)}, 'Re-Run')
                                ]),
                                div({id: id})
                            ])
                        });
                    mount = node;
                    container = dom.createElement('div');
                    container.innerHTML = content;
                    dom.append(mount, container);
                    scatterNode = dom.nodeForId(id);
                    // runtime.getService('ui').setTitle('Big Scatterplot with vega');
                    runtime.send('ui', 'setTitle', 'Big Scatterplot with vega');
                });
            }
            function start(params) {
                return Promise.try(function () {
                    domEventManager.attachEvents();                    
                });
            }
            function run(params) {
                return Promise.try(function () {
                    var data = getData();
                    var scatter = vegaChartHelper.spec.scatter({
                        color: 'blue',
                        size: 20,
                        data: data,
                        height: 400,
                        width: 700,
                        xAxis: {
                            title: 'X Axis'
                        },
                        yAxis: {
                            title: 'Y Axis'
                        }
                    });

                    vega.parse.spec(scatter, function (chart) {
                        chart({el: scatterNode}).update();
                    });
                });
            }
            function stop() {
                return Promise.try(function () {
                    domEventManager.detachEvents();
                });
            }
            function detach() {
                return Promise.try(function () {
                    mount.removeChild(container);
                });
            }

            return {
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